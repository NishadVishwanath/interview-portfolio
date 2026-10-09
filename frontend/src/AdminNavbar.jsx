import { useState } from "react";

const adminLinks = [
  ["Overview", "#dashboard"],
  ["Profile", "#profile"],
  ["Projects", "#projects"],
  ["Experience", "#experience"],
  ["Certifications", "#certifications"],
  ["Messages", "#messages"],
];

export default function AdminNavbar({ onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="admin-header">
      <a aria-label="Portfolio admin home" className="admin-brand" href="/admin">
        <span aria-hidden="true" className="admin-brand-mark">P</span>
        <span>PORTFOLIO <span className="admin-brand-divider">/</span> ADMIN</span>
      </a>
      <button
        aria-controls="admin-navigation"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Close admin navigation" : "Open admin navigation"}
        className={`admin-menu-toggle${menuOpen ? " is-open" : ""}`}
        onClick={() => setMenuOpen((open) => !open)}
        type="button"
      >
        <span />
        <span />
      </button>
      <nav
        aria-label="Admin navigation"
        className={`admin-navigation${menuOpen ? " is-open" : ""}`}
        id="admin-navigation"
      >
        {adminLinks.map(([label, href], index) => (
          <a
            aria-current={index === 0 ? "page" : undefined}
            className={index === 0 ? "is-active" : ""}
            href={href}
            key={label}
            onClick={closeMenu}
          >
            {label}
          </a>
        ))}
        <a className="admin-view-site" href="/" onClick={closeMenu}>
          View site <ArrowIcon diagonal />
        </a>
        <button className="admin-logout" onClick={onLogout} type="button">
          Sign out
        </button>
      </nav>
    </header>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="arrow-icon" viewBox="0 0 20 20" fill="none">
      <path d="M5 15 15 5M6 5h9v9" />
    </svg>
  );
}
