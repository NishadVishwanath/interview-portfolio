import base64
import hashlib
import smtplib

from fastapi.testclient import TestClient

from app.main import app, connection_string, send_contact_notification


def test_health_returns_ok():
    response = TestClient(app).get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_connection_string_supports_windows_trusted_auth(monkeypatch):
    monkeypatch.setenv("SQL_SERVER", "localhost")
    monkeypatch.setenv("SQL_DATABASE", "Portfolio")
    monkeypatch.setenv("SQL_TRUSTED_CONNECTION", "yes")
    monkeypatch.delenv("SQL_USER", raising=False)
    monkeypatch.delenv("SQL_PASSWORD", raising=False)

    result = connection_string()

    assert "SERVER={localhost}" in result
    assert "DATABASE={Portfolio}" in result
    assert "Trusted_Connection={yes}" in result
    assert "UID=" not in result
    assert "PWD=" not in result


def configure_admin(monkeypatch):
    salt = b"test-admin-salt"
    digest = hashlib.pbkdf2_hmac("sha256", b"correct-test-password", salt, 1000)
    encode = lambda value: base64.urlsafe_b64encode(value).decode().rstrip("=")
    monkeypatch.setenv(
        "ADMIN_PASSWORD_HASH",
        f"pbkdf2_sha256$1000${encode(salt)}${encode(digest)}",
    )
    monkeypatch.setenv("ADMIN_USERNAME", "Admin")
    monkeypatch.setenv("ADMIN_SESSION_SECRET", "test-session-secret-at-least-32-chars")


def test_admin_login_sets_http_only_session_and_logout_revokes_it(monkeypatch):
    configure_admin(monkeypatch)
    client = TestClient(app)

    login = client.post(
        "/api/auth/login",
        json={"username": "Admin", "password": "correct-test-password"},
    )

    assert login.status_code == 200
    cookie = login.headers["set-cookie"].lower()
    assert "httponly" in cookie
    assert "samesite=strict" in cookie
    assert client.get("/api/auth/me").json() == {"username": "Admin"}

    logout = client.post("/api/auth/logout")

    assert logout.status_code == 204
    assert client.get("/api/auth/me").status_code == 401


def test_admin_login_rejects_wrong_password(monkeypatch):
    configure_admin(monkeypatch)

    response = TestClient(app).post(
        "/api/auth/login",
        json={"username": "Admin", "password": "incorrect-password"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect user ID or password."


def test_admin_content_requires_a_valid_session(monkeypatch):
    configure_admin(monkeypatch)
    client = TestClient(app)

    assert client.get("/api/auth/me").status_code == 401
    login = client.post(
        "/api/auth/login",
        json={"username": "Admin", "password": "correct-test-password"},
    )
    assert login.status_code == 200
    assert client.get("/api/auth/me").status_code == 200


def test_contact_stores_valid_message(monkeypatch):
    captured = {}

    def fake_save_contact(**values):
        captured.update(values)

    monkeypatch.setattr("app.main.save_contact", fake_save_contact)
    monkeypatch.setattr("app.main.send_contact_notification", lambda **_: (False, False))
    response = TestClient(app).post(
        "/api/contact",
        json={
            "name": "Jordan Lee",
            "email": "jordan@example.com",
            "subject": "Hello",
            "message": "I'd like to talk about the role.",
        },
    )

    assert response.status_code == 201
    assert response.json() == {
        "message": "Your message was saved, but email notifications are not configured.",
        "notification_configured": False,
        "notification_sent": False,
    }
    assert captured == {
        "name": "Jordan Lee",
        "email": "jordan@example.com",
        "subject": "Hello",
        "message": "I'd like to talk about the role.",
    }


def test_contact_sends_notification_after_saving(monkeypatch):
    monkeypatch.setattr("app.main.save_contact", lambda **_: None)
    captured = {}

    def fake_send_notification(**values):
        captured.update(values)
        return True, True

    monkeypatch.setattr("app.main.send_contact_notification", fake_send_notification)
    response = TestClient(app).post(
        "/api/contact",
        json={
            "name": "Jordan Lee",
            "email": "jordan@example.com",
            "subject": "Hello",
            "message": "I'd like to talk about the role.",
        },
    )

    assert response.status_code == 201
    assert response.json() == {
        "message": "Your message was saved and its notification was accepted by the mail server.",
        "notification_configured": True,
        "notification_sent": True,
    }
    assert captured["sender_email"] == "jordan@example.com"


def test_smtp_notification_targets_both_owner_addresses(monkeypatch):
    for key, value in {
        "SMTP_HOST": "smtp.example.com",
        "SMTP_PORT": "587",
        "SMTP_USERNAME": "sender@example.com",
        "SMTP_PASSWORD": "test-app-password",
        "SMTP_FROM_EMAIL": "sender@example.com",
        "CONTACT_NOTIFICATION_EMAILS": "owner@example.com,owner@outlook.com",
    }.items():
        monkeypatch.setenv(key, value)
    sent = {}

    class FakeSMTP:
        def __init__(self, host, port, timeout):
            sent["connection"] = (host, port, timeout)

        def __enter__(self):
            return self

        def __exit__(self, *_):
            return False

        def ehlo(self):
            pass

        def starttls(self, context):
            sent["tls"] = True

        def login(self, username, password):
            sent["login"] = (username, password)

        def send_message(self, message):
            sent["message"] = message

    monkeypatch.setattr("app.main.smtplib.SMTP", FakeSMTP)
    result = send_contact_notification(
        name="Jordan Lee",
        sender_email="jordan@example.com",
        subject="Interview",
        message="I'd like to talk about the role.",
    )

    assert result == (True, True)
    assert sent["connection"] == ("smtp.example.com", 587, 10)
    assert sent["tls"] is True
    assert sent["login"] == ("sender@example.com", "test-app-password")
    assert sent["message"]["To"] == "owner@example.com, owner@outlook.com"
    assert sent["message"]["Reply-To"] == "jordan@example.com"


def test_contact_is_saved_even_when_notification_fails(monkeypatch):
    monkeypatch.setattr("app.main.save_contact", lambda **_: None)
    monkeypatch.setattr(
        "app.main.send_contact_notification",
        lambda **_: (_ for _ in ()).throw(smtplib.SMTPException("SMTP unavailable")),
    )
    response = TestClient(app).post(
        "/api/contact",
        json={"name": "Jordan", "email": "jordan@example.com", "message": "A valid-length message"},
    )

    assert response.status_code == 201
    assert response.json()["notification_configured"] is True
    assert response.json()["notification_sent"] is False
    assert "could not be sent" in response.json()["message"]


def test_contact_rejects_invalid_email_without_storing(monkeypatch):
    def unexpected_save(**_):
        raise AssertionError("Invalid input must not reach storage")

    monkeypatch.setattr("app.main.save_contact", unexpected_save)
    response = TestClient(app).post(
        "/api/contact",
        json={"name": "Jordan", "email": "not-an-email", "message": "A valid-length message"},
    )

    assert response.status_code == 422


def test_contact_database_failure_returns_safe_service_error(monkeypatch):
    def fail_save(**_):
        raise RuntimeError("Internal connection details")

    monkeypatch.setattr("app.main.save_contact", fail_save)
    response = TestClient(app).post(
        "/api/contact",
        json={"name": "Jordan", "email": "jordan@example.com", "message": "A valid-length message"},
    )

    assert response.status_code == 503
    assert response.json() == {
        "detail": "The contact service is temporarily unavailable. Please try again later."
    }
    assert "Internal connection details" not in response.text
