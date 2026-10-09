import base64
import getpass
import hashlib
import secrets


def encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode().rstrip("=")


def main() -> None:
    password = getpass.getpass("Admin password (input hidden): ")
    if len(password) < 12:
        raise SystemExit("Use a password with at least 12 characters.")

    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 600_000)
    print(f"pbkdf2_sha256$600000${encode(salt)}${encode(digest)}")


if __name__ == "__main__":
    main()
