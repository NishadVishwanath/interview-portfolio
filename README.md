# Personal portfolio starter

A responsive, enterprise-style React portfolio with a FastAPI contact endpoint backed by Microsoft SQL Server. The public portfolio and admin panel use a white canvas and cards with plum, mauve, sage, lime, and coral accents. The name, bio, projects, skills, experience, email, and visual styling are intentionally editable sample content; replace them with accurate details before publishing. No real identity, credentials, or achievements are claimed here.

## Project layout

- `frontend/` — React 18 and Vite single-page portfolio
- `backend/` — FastAPI service, request validation, and API tests
- `backend/sql/schema.sql` — SQL Server contact-message table setup

## Requirements

- Node.js 18+ and npm
- Python 3.10+
- Microsoft SQL Server (local, containerized, or hosted)
- Microsoft ODBC Driver 18 for SQL Server installed on the backend host

## Database setup

1. Create a database named `Portfolio` (or choose a different name).
2. Run `backend/sql/schema.sql` against that database using SQL Server Management Studio, Azure Data Studio, or `sqlcmd`.
3. Create a SQL Server login with permission to insert rows into `dbo.ContactMessages`. Keep the login credentials out of source control. On Windows, you can instead set `SQL_TRUSTED_CONNECTION=yes` to use the account running FastAPI.
4. Copy `backend/.env.example` to `backend/.env` if you have not already configured it. For a local SQL Server with a trusted development certificate, `SQL_TRUST_SERVER_CERTIFICATE=yes` is convenient; use properly validated certificates in production.

The API loads `backend/.env` on startup and does not create or modify database schema automatically. This Windows development workspace is configured to use SQL Server Windows trusted authentication with a local `Portfolio` database. The contact endpoint uses parameterized SQL and returns a safe `503` response if the database is unavailable.

## Run locally

Open two terminals from the project root.

**Backend**

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
# Edit .env with your SQL Server settings.
uvicorn app.main:app --reload
```

The API is available at `http://localhost:8000`; interactive API docs are at `http://localhost:8000/docs`.

**Frontend**

```powershell
cd frontend
npm install
Copy-Item .env.example .env
# Set VITE_API_BASE_URL if the API is not at http://localhost:8000.
npm run dev
```

Open `http://localhost:5173`. The contact form saves messages to SQL Server through `POST /api/contact`. When SMTP is configured, the API also sends a notification to the addresses in `CONTACT_NOTIFICATION_EMAILS`; it reports separately whether that email was accepted by the mail server. If SMTP is unavailable, the message remains saved and the form offers a prefilled email draft as a fallback.

To enable Gmail notifications, use a Google App Password for `SMTP_PASSWORD` (not your normal account password), then fill in the SMTP settings in `backend/.env` and restart FastAPI. Keep that app password private and out of source control. Until valid SMTP credentials are configured, submissions will be saved to SQL Server but no notification email will be sent.

## Edit portfolio content

Open `http://localhost:5173/admin` and sign in to edit your profile, projects, experience entries, and certifications. You can add or remove projects and experience entries and attach JPG, PNG, or WebP images up to 350 KB. Certifications support JPG, PNG, WebP, or PDF uploads up to 1 MB, plus an optional credential verification URL. Save each section to update the public portfolio.

Portfolio edits and uploaded certification files are stored in this browser's local storage, not in SQL Server; they are not shared automatically with other browsers or devices. A clearly marked sample certification is included for preview; replace or remove it before publishing.

Admin credentials are configured in the ignored `backend/.env` file. The password is stored there only as a salted PBKDF2 hash; a separate random secret signs an HTTP-only, SameSite session cookie. The credentials provided for this local setup are weak; replace them with a unique strong password before any public deployment, set `ADMIN_COOKIE_SECURE=yes` behind HTTPS, and keep `.env` private. Portfolio edits are still stored in the current browser's local storage rather than SQL Server.

To generate a password hash for a new setup, run `python -m app.generate_admin_hash` from `backend/` and paste its output into `ADMIN_PASSWORD_HASH` in `backend/.env`. The password prompt is hidden; the plain password is not written to the file.

## Checks

```powershell
# From backend/
python -m pytest

# From frontend/
npm run build
```

The API tests stub SQL writes, so they do not require a running database. A real contact submission requires the SQL Server schema, ODBC driver, and environment settings above.

## Personalize before an interview

- Edit profile, project, and experience content at `/admin`, or change the starter data in `frontend/src/portfolioData.js`.
- Replace the sample skills, concept projects, experience entries, and placeholder copy with truthful information and links.
- Change `hello@example.com` to an address you want to publish.
- Adjust colors and typography in `frontend/src/styles.css`.
- Set production `VITE_API_BASE_URL` and backend `FRONTEND_ORIGINS` to your deployed frontend/API origins.
