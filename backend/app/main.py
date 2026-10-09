import base64
import hashlib
import hmac
import logging
import os
import secrets
import smtplib
import ssl
import time
from contextlib import asynccontextmanager
from email.message import EmailMessage
from pathlib import Path
from typing import Annotated

import pyodbc
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, EmailStr, Field

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

logger = logging.getLogger("portfolio.api")

ADMIN_SESSION_COOKIE = "portfolio_admin_session"
ADMIN_SESSION_MAX_AGE = 8 * 60 * 60


def _decode_urlsafe(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def _password_matches(password: str) -> bool:
    encoded_hash = os.getenv("ADMIN_PASSWORD_HASH", "")
    try:
        algorithm, iterations, salt, expected = encoded_hash.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        actual = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode(),
            _decode_urlsafe(salt),
            int(iterations),
        )
        return hmac.compare_digest(actual, _decode_urlsafe(expected))
    except (ValueError, TypeError):
        return False


def _session_secret() -> bytes:
    secret = os.getenv("ADMIN_SESSION_SECRET", "")
    if len(secret) < 32:
        raise RuntimeError("ADMIN_SESSION_SECRET must contain at least 32 characters")
    return secret.encode()


def _create_admin_session(username: str) -> str:
    expires = int(time.time()) + ADMIN_SESSION_MAX_AGE
    payload = base64.urlsafe_b64encode(f"{username}\n{expires}".encode()).decode().rstrip("=")
    signature = hmac.new(_session_secret(), payload.encode(), hashlib.sha256).digest()
    encoded_signature = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    return f"{payload}.{encoded_signature}"


def _get_admin_username(request: Request) -> str | None:
    token = request.cookies.get(ADMIN_SESSION_COOKIE, "")
    try:
        payload, signature = token.split(".", 1)
        expected_signature = hmac.new(
            _session_secret(), payload.encode(), hashlib.sha256
        ).digest()
        if not hmac.compare_digest(expected_signature, _decode_urlsafe(signature)):
            return None
        username, expires = _decode_urlsafe(payload).decode().split("\n", 1)
        if int(expires) < int(time.time()):
            return None
        if not hmac.compare_digest(
            username.encode(), os.getenv("ADMIN_USERNAME", "Admin").encode()
        ):
            return None
        return username
    except (RuntimeError, ValueError, UnicodeDecodeError):
        return None


def _connection_value(value: str) -> str:
    """Quote an ODBC connection-string value, including embedded closing braces."""
    return "{" + value.replace("}", "}}") + "}"


def connection_string() -> str:
    trusted_connection = os.getenv("SQL_TRUSTED_CONNECTION", "no").lower() in {
        "1",
        "true",
        "yes",
    }
    required = ["SQL_SERVER", "SQL_DATABASE"]
    if not trusted_connection:
        required.extend(("SQL_USER", "SQL_PASSWORD"))
    missing = [key for key in required if not os.getenv(key)]
    if missing:
        raise RuntimeError(f"Missing required database configuration: {', '.join(missing)}")

    values = {
        "DRIVER": os.getenv("SQL_DRIVER", "ODBC Driver 18 for SQL Server"),
        "SERVER": os.environ["SQL_SERVER"],
        "DATABASE": os.environ["SQL_DATABASE"],
        "Encrypt": os.getenv("SQL_ENCRYPT", "yes"),
        "TrustServerCertificate": os.getenv("SQL_TRUST_SERVER_CERTIFICATE", "no"),
    }
    if trusted_connection:
        values["Trusted_Connection"] = "yes"
    else:
        values["UID"] = os.environ["SQL_USER"]
        values["PWD"] = os.environ["SQL_PASSWORD"]
    return ";".join(
        f"{key}={_connection_value(value)}" for key, value in values.items()
    )


def save_contact(name: str, email: str, subject: str | None, message: str) -> None:
    with pyodbc.connect(connection_string(), timeout=5) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO dbo.ContactMessages (name, email, subject, message)
                VALUES (?, ?, ?, ?)
                """,
                name,
                email,
                subject,
                message,
            )
        connection.commit()


def send_contact_notification(
    name: str,
    sender_email: str,
    subject: str | None,
    message: str,
) -> tuple[bool, bool]:
    required = (
        "SMTP_HOST",
        "SMTP_USERNAME",
        "SMTP_PASSWORD",
        "SMTP_FROM_EMAIL",
        "CONTACT_NOTIFICATION_EMAILS",
    )
    if any(not os.getenv(key) for key in required):
        return False, False

    recipients = [
        address.strip()
        for address in os.environ["CONTACT_NOTIFICATION_EMAILS"].split(",")
        if address.strip()
    ]
    if not recipients:
        return False, False

    email_message = EmailMessage()
    email_message["Subject"] = f"Portfolio contact: {subject or 'New message'}"
    email_message["From"] = os.environ["SMTP_FROM_EMAIL"]
    email_message["To"] = ", ".join(recipients)
    email_message["Reply-To"] = sender_email
    email_message.set_content(
        f"Name: {name}\nEmail: {sender_email}\n\n{message}"
    )

    port = int(os.getenv("SMTP_PORT", "587"))
    with smtplib.SMTP(os.environ["SMTP_HOST"], port, timeout=10) as server:
        server.ehlo()
        if os.getenv("SMTP_STARTTLS", "yes").lower() in {"1", "true", "yes"}:
            server.starttls(context=ssl.create_default_context())
            server.ehlo()
        server.login(os.environ["SMTP_USERNAME"], os.environ["SMTP_PASSWORD"])
        server.send_message(email_message)

    return True, True


class ContactMessage(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    name: Annotated[str, Field(min_length=1, max_length=100)]
    email: Annotated[EmailStr, Field(max_length=254)]
    subject: Annotated[str | None, Field(default=None, max_length=160)]
    message: Annotated[str, Field(min_length=10, max_length=5000)]


class ContactReceipt(BaseModel):
    message: str
    notification_configured: bool
    notification_sent: bool


class AdminLogin(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    username: Annotated[str, Field(min_length=1, max_length=100)]
    password: Annotated[str, Field(min_length=1, max_length=256)]


class AdminSession(BaseModel):
    username: str


@asynccontextmanager
async def lifespan(_: FastAPI):
    logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
    yield


app = FastAPI(
    title="Portfolio Contact API",
    version="1.0.0",
    description="Stores messages submitted through the portfolio contact form.",
    lifespan=lifespan,
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/auth/login", response_model=AdminSession)
def admin_login(credentials: AdminLogin, response: Response) -> AdminSession:
    configured_username = os.getenv("ADMIN_USERNAME", "")
    if (
        not configured_username
        or not os.getenv("ADMIN_PASSWORD_HASH")
        or len(os.getenv("ADMIN_SESSION_SECRET", "")) < 32
    ):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin sign-in is not configured.",
        )

    if not hmac.compare_digest(
        credentials.username.encode(), configured_username.encode()
    ) or not _password_matches(credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect user ID or password.",
        )

    response.set_cookie(
        key=ADMIN_SESSION_COOKIE,
        value=_create_admin_session(configured_username),
        max_age=ADMIN_SESSION_MAX_AGE,
        httponly=True,
        secure=os.getenv("ADMIN_COOKIE_SECURE", "no").lower() in {"1", "true", "yes"},
        samesite="strict",
        path="/api/auth",
    )
    return AdminSession(username=configured_username)


@app.get("/api/auth/me", response_model=AdminSession)
def admin_session(request: Request) -> AdminSession:
    username = _get_admin_username(request)
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin sign-in required.",
        )
    return AdminSession(username=username)


@app.post("/api/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
def admin_logout(response: Response) -> Response:
    response.delete_cookie(
        key=ADMIN_SESSION_COOKIE,
        path="/api/auth",
        httponly=True,
        samesite="strict",
    )
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@app.post(
    "/api/contact",
    response_model=ContactReceipt,
    status_code=status.HTTP_201_CREATED,
)
def create_contact(message: ContactMessage) -> ContactReceipt:
    try:
        save_contact(
            name=message.name,
            email=str(message.email),
            subject=message.subject or None,
            message=message.message,
        )
    except (pyodbc.Error, RuntimeError):
        logger.exception("Could not store portfolio contact message")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The contact service is temporarily unavailable. Please try again later.",
        ) from None
    notification_configured = False
    notification_sent = False
    try:
        notification_configured, notification_sent = send_contact_notification(
            name=message.name,
            sender_email=str(message.email),
            subject=message.subject or None,
            message=message.message,
        )
    except (OSError, smtplib.SMTPException, ValueError):
        logger.exception("Contact message was saved, but its email notification failed")
        notification_configured = True

    if notification_sent:
        receipt_message = "Your message was saved and its notification was accepted by the mail server."
    elif notification_configured:
        receipt_message = "Your message was saved, but its email notification could not be sent."
    else:
        receipt_message = "Your message was saved, but email notifications are not configured."

    return ContactReceipt(
        message=receipt_message,
        notification_configured=notification_configured,
        notification_sent=notification_sent,
    )
