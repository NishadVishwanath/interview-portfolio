import { useEffect, useState } from "react";
import AdminNavbar from "./AdminNavbar.jsx";
import AdminContentEditor from "./AdminContentEditor.jsx";
import {
  loadPortfolioData,
  savePortfolioData,
} from "./portfolioData.js";

const skills = [
  {
    number: "01",
    title: "Product & strategy",
    items: ["Product thinking", "User research", "Roadmapping", "Prioritization"],
  },
  {
    number: "02",
    title: "Design & delivery",
    items: ["Interaction design", "Prototyping", "Design systems", "Accessibility"],
  },
  {
    number: "03",
    title: "Technology",
    items: ["React", "JavaScript", "REST APIs", "SQL fundamentals"],
  },
];

function ArrowIcon({ diagonal = false }) {
  return (
    <svg
      aria-hidden="true"
      className="arrow-icon"
      viewBox="0 0 20 20"
      fill="none"
    >
      {diagonal ? (
        <path d="M5 15 15 5M6 5h9v9" />
      ) : (
        <path d="M3.5 10h12m-5-5 5 5-5 5" />
      )}
    </svg>
  );
}

function Header({ profile, showCertifications }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    ["About", "#about"],
    ["Work", "#work"],
    ["Experience", "#experience"],
    ...(showCertifications ? [["Certifications", "#certifications"]] : []),
  ];

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <a className="wordmark" href="#home" onClick={closeMenu}>
        {profile.name}<span className="wordmark-dot">.</span>
      </a>
      <button
        aria-controls="primary-navigation"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        className={`menu-toggle${menuOpen ? " is-open" : ""}`}
        onClick={() => setMenuOpen((open) => !open)}
        type="button"
      >
        <span />
        <span />
      </button>
      <nav
        aria-label="Main navigation"
        className={`primary-navigation${menuOpen ? " is-open" : ""}`}
        id="primary-navigation"
      >
        {links.map(([label, href]) => (
          <a href={href} key={label} onClick={closeMenu}>
            {label}
          </a>
        ))}
        <a className="nav-contact" href="#contact" onClick={closeMenu}>
          Let&apos;s talk <ArrowIcon diagonal />
        </a>
      </nav>
    </header>
  );
}

function Hero({ profile }) {
  return (
    <section aria-labelledby="hero-title" className="hero section-shell" id="home">
      <div className="hero-copy">
        <div className="availability">
          <span aria-hidden="true" className="availability-dot" />
          OPEN TO THE RIGHT OPPORTUNITY
        </div>
        <h1 id="hero-title">{profile.headline}</h1>
        <p className="hero-intro">
          Hi, I&apos;m <strong>{profile.name}</strong> — {profile.role}.
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href="#work">
            Explore my work <ArrowIcon />
          </a>
          <a className="text-link" href="#about">
            A little about me <ArrowIcon diagonal />
          </a>
        </div>
      </div>
      {profile.image ? (
        <img alt={`${profile.name} portfolio portrait`} className="hero-art hero-profile-image" src={profile.image} />
      ) : (
        <div aria-label="Abstract colorful portfolio illustration" className="hero-art" role="img">
          <div className="art-sun" />
          <div className="art-orbit art-orbit-one" />
          <div className="art-orbit art-orbit-two" />
          <div className="art-card">
            <span>THE SHORT VERSION</span>
            <p>Curious by nature.<br />Thoughtful by design.</p>
            <span className="art-card-mark">Y—N / 2025</span>
          </div>
          <span className="art-caption">A WORK IN PROGRESS, LIKE ALL OF US.</span>
        </div>
      )}
      <a aria-label="Scroll to about" className="scroll-cue" href="#about">
        <span />
        SCROLL TO EXPLORE
      </a>
    </section>
  );
}

function About({ profile }) {
  return (
    <section aria-labelledby="about-title" className="about section-shell" id="about">
      <div className="section-kicker"><span>01</span> A LITTLE ABOUT ME</div>
      <div className="about-content">
        <h2 id="about-title">
          I like the part where{" "}
          <span className="serif-accent">it all starts to make sense.</span>
        </h2>
        <div className="about-description">
          <p>
            {profile.about}
          </p>
          <a className="text-link" href="#contact">
            More about me, over a chat <ArrowIcon diagonal />
          </a>
        </div>
      </div>
      <div className="values-strip">
        <span>ASK GOOD QUESTIONS</span><span aria-hidden="true">✳</span>
        <span>MAKE IT CLEAR</span><span aria-hidden="true">✳</span>
        <span>STAY HUMAN</span><span aria-hidden="true">✳</span>
        <span>KEEP LEARNING</span>
      </div>
    </section>
  );
}

function Skills() {
  return (
    <section aria-labelledby="skills-title" className="skills-section section-shell">
      <div className="section-kicker"><span>02</span> HOW I WORK</div>
      <div className="skills-heading">
        <h2 id="skills-title">A few tools<br />in my <span className="serif-accent">toolkit.</span></h2>
        <p>
          The right approach depends on the problem. These are some of the
          capabilities I bring to a team and continue to grow.
        </p>
      </div>
      <div className="skills-grid">
        {skills.map((group) => (
          <article className="skill-card" key={group.number}>
            <span className="skill-number">{group.number}</span>
            <h3>{group.title}</h3>
            <ul>
              {group.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function Work({ projects }) {
  return (
    <section aria-labelledby="work-title" className="work-section" id="work">
      <div className="section-shell">
        <div className="section-kicker"><span>03</span> SELECTED WORK</div>
        <div className="work-heading">
          <h2 id="work-title">A few things<br />I&apos;ve <span className="serif-accent">been making.</span></h2>
          <p>Sample concepts to show how projects can look. Swap in your real work, process, and outcomes.</p>
        </div>
        <div className="projects-grid">
          {projects.map((project) => (
            <article className="project-card" key={project.number}>
              <div aria-hidden="true" className={`project-visual ${project.visual}`}>
                {project.image ? (
                  <img alt="" className="project-image" src={project.image} />
                ) : (
                  <>
                    <span className="project-visual-label">{project.mark}</span>
                    <span className="project-shape" />
                    <span className="project-visual-index">{project.number}</span>
                  </>
                )}
              </div>
              <div className="project-details">
                <span className="project-type">{project.type}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <ul aria-label={`${project.title} skills`} className="tag-list">
                  {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Experience({ experience }) {
  return (
    <section aria-labelledby="experience-title" className="experience-section section-shell" id="experience">
      <div className="section-kicker"><span>04</span> THE PATH SO FAR</div>
      <div className="experience-layout">
        <div className="experience-intro">
          <h2 id="experience-title">Places I&apos;ve<br /> <span className="serif-accent">learned things.</span></h2>
          <p>Use this space to tell the story of your experience, in your own words.</p>
          <a className="text-link" href="#contact">
            Ask me about it <ArrowIcon diagonal />
          </a>
        </div>
        <div className="timeline">
          {experience.map((item) => (
            <article className="timeline-item" key={item.title}>
              <span className="timeline-date">{item.date}</span>
              <div>
                <h3>{item.title}</h3>
                <span className="timeline-company">{item.organization}</span>
                <p>{item.description}</p>
                {item.image && <img alt={`${item.title} experience`} className="timeline-image" src={item.image} />}
              </div>
              <span aria-hidden="true" className="timeline-dot" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Certifications({ certifications }) {
  if (!certifications.length) return null;

  return (
    <section aria-labelledby="certifications-title" className="certifications-section section-shell" id="certifications">
      <div className="section-kicker"><span>05</span> LEARNING & CREDENTIALS</div>
      <div className="certifications-heading">
        <h2 id="certifications-title">Proof of my<br /><span className="serif-accent">curiosity.</span></h2>
        <p>Courses and credentials that reflect what I&apos;ve been learning along the way.</p>
      </div>
      <div className="certifications-grid">
        {certifications.map((certificate, index) => (
          <article className="certification-card" key={`${certificate.title}-${index}`}>
            {certificate.file && certificate.fileType?.startsWith("image/") ? (
              <a aria-label={`View ${certificate.title} certificate`} className="certification-preview" href={certificate.file} rel="noreferrer" target="_blank">
                <img alt={`${certificate.title} certificate`} src={certificate.file} />
              </a>
            ) : (
              <div aria-hidden="true" className="certification-preview certification-document">
                <span>{certificate.fileType === "application/pdf" ? "PDF" : "CERTIFICATE"}</span>
              </div>
            )}
            <div className="certification-details">
              <div>
                {certificate.isDemo && <span className="certification-demo-badge">DEMO · SAMPLE ONLY</span>}
                {certificate.date && <span className="certification-date">{certificate.date}</span>}
                <h3>{certificate.title}</h3>
                <p>{certificate.issuer}</p>
              </div>
              <div className="certification-links">
                {certificate.file && (
                  <a href={certificate.file} rel="noreferrer" target="_blank">
                    View certificate <ArrowIcon diagonal />
                  </a>
                )}
                {certificate.credentialUrl && (
                  <a href={certificate.credentialUrl} rel="noreferrer" target="_blank">
                    Verify credential <ArrowIcon diagonal />
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Contact({ profile }) {
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL ||
      `${window.location.protocol}//${window.location.hostname}:8000`;
    const subject = String(formData.get("subject") || "Portfolio contact");
    const emailBody = [
      `Name: ${formData.get("name")}`,
      `Email: ${formData.get("email")}`,
      "",
      String(formData.get("message")),
    ].join("\n");
    const fallbackHref = `mailto:${encodeURIComponent(profile.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

    setSubmitting(true);
    setStatus({ type: "loading", message: "Sending your note…" });

    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          subject: formData.get("subject"),
          message: formData.get("message"),
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        const detail = result.detail;
        const message = Array.isArray(detail)
          ? detail.map((issue) => issue.msg).join(" ")
          : detail || "We couldn't send your message. Please try again.";
        throw new Error(message);
      }

      const receipt = await response.json();
      form.reset();
      setStatus({
        type: receipt.notification_sent ? "success" : "warning",
        message: receipt.message,
        fallbackHref: receipt.notification_sent ? undefined : fallbackHref,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof TypeError
          ? "The contact service couldn't be reached."
          : `${error.message}`,
        fallbackHref,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="contact-title" className="contact-section" id="contact">
      <div className="section-shell contact-layout">
        <div className="contact-copy">
          <div className="section-kicker"><span>06</span> YOUR TURN</div>
          <h2 id="contact-title">Something on<br />your <span className="serif-accent">mind?</span></h2>
          <p>Good conversations can start anywhere. Tell me what you&apos;re thinking about.</p>
          <div className="contact-email-list">
            {[profile.email, profile.secondaryEmail]
              .filter(Boolean)
              .map((email) => (
                <a className="contact-email" href={`mailto:${email}`} key={email}>
                  {email} <ArrowIcon diagonal />
                </a>
              ))}
          </div>
        </div>
        <form className="contact-form" onSubmit={handleSubmit}>
          <label htmlFor="contact-name">Your name</label>
          <input autoComplete="name" id="contact-name" maxLength="100" name="name" placeholder="What should I call you?" required />
          <label htmlFor="contact-email">Email address</label>
          <input autoComplete="email" id="contact-email" maxLength="254" name="email" placeholder="you@example.com" required type="email" />
          <label htmlFor="contact-subject">What&apos;s this about? <span>(optional)</span></label>
          <input id="contact-subject" maxLength="160" name="subject" placeholder="A quick hello, an idea, an opportunity…" />
          <label htmlFor="contact-message">Your message</label>
          <textarea id="contact-message" maxLength="5000" minLength="10" name="message" placeholder="A little context goes a long way." required rows="4" />
          <div aria-live="polite" className={`form-status ${status.type}`} role={status.type === "error" ? "alert" : "status"}>
            {status.message}
            {status.fallbackHref && (
              <a className="contact-fallback" href={status.fallbackHref}>
                Open a prefilled email draft
              </a>
            )}
          </div>
          <button className="button button-primary submit-button" disabled={submitting} type="submit">
            {submitting ? "Sending…" : "Send your note"} <ArrowIcon />
          </button>
          <p className="form-note">Your message is sent to the portfolio owner through this site&apos;s contact service.</p>
        </form>
      </div>
    </section>
  );
}

function Footer({ profile }) {
  return (
    <footer className="site-footer section-shell">
      <a className="wordmark" href="#home">{profile.name}<span className="wordmark-dot">.</span></a>
      <span>Made with curiosity and a little coffee.</span>
      <a href="#home">BACK TO TOP ↑</a>
      <a className="admin-entry" href="/admin">ADMIN</a>
    </footer>
  );
}

export default function App() {
  const [portfolio, setPortfolio] = useState(loadPortfolioData);
  const certifications = portfolio.certifications || [];

  function updatePortfolio(updatedPortfolio) {
    savePortfolioData(updatedPortfolio);
    setPortfolio(updatedPortfolio);
  }

  if (window.location.pathname.replace(/\/$/, "") === "/admin") {
    return <AdminPage portfolio={portfolio} onSave={updatePortfolio} />;
  }

  return (
    <>
      <div className="demo-banner">
        <span>This is an editable demo portfolio — personalize the sample content before sharing.</span>
      </div>
      <Header profile={portfolio.profile} showCertifications={certifications.length > 0} />
      <main>
        <Hero profile={portfolio.profile} />
        <About profile={portfolio.profile} />
        <Skills />
        <Work projects={portfolio.projects} />
        <Experience experience={portfolio.experience} />
        <Certifications certifications={certifications} />
        <Contact profile={portfolio.profile} />
      </main>
      <Footer profile={portfolio.profile} />
    </>
  );
}

function AdminPage({ portfolio, onSave }) {
  const [authState, setAuthState] = useState("checking");
  const [authMessage, setAuthMessage] = useState("");
  const [username, setUsername] = useState("");
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL ||
    `${window.location.protocol}//${window.location.hostname}:8000`;

  useEffect(() => {
    let active = true;

    fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/auth/me`, {
      credentials: "include",
    })
      .then((response) => {
        if (!active) return;
        if (response.ok) {
          setAuthState("authenticated");
        } else if (response.status === 401) {
          setAuthState("login");
        } else {
          setAuthState("unavailable");
          setAuthMessage("Could not check the admin session. Please try again.");
        }
      })
      .catch(() => {
        if (!active) return;
        setAuthState("unavailable");
        setAuthMessage("Could not reach the sign-in service. Make sure FastAPI is running.");
      });

    return () => {
      active = false;
    };
  }, [apiBaseUrl]);

  async function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setAuthMessage("");
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.get("username"),
          password: formData.get("password"),
        }),
      });
      if (!response.ok) {
        const result = await response.json();
        setAuthMessage(result.detail || "Sign-in failed. Try again.");
        return;
      }
      setUsername(String(formData.get("username")));
      setAuthState("authenticated");
    } catch {
      setAuthMessage("Could not reach the sign-in service. Make sure FastAPI is running.");
    }
  }

  async function handleLogout() {
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        setAuthMessage("Could not sign out. Please try again.");
        return;
      }
      setUsername("");
      setAuthMessage("");
      setAuthState("login");
    } catch {
      setAuthMessage("Could not reach the sign-in service. Please try again.");
    }
  }

  if (authState !== "authenticated") {
    return (
      <main className="admin-auth-page">
        <section aria-labelledby="admin-login-title" className="admin-auth-card">
          <a className="admin-brand admin-auth-brand" href="/">
            <span aria-hidden="true" className="admin-brand-mark">P</span>
            <span>PORTFOLIO <span className="admin-brand-divider">/</span> ADMIN</span>
          </a>
          {authState === "checking" ? (
            <p className="admin-auth-message" role="status">Checking sign-in…</p>
          ) : (
            <>
              <h1 id="admin-login-title">Admin sign-in</h1>
              <p className="admin-auth-description">Sign in to manage your portfolio.</p>
              {authState === "unavailable" ? (
                <p className="admin-auth-error" role="alert">{authMessage}</p>
              ) : (
                <form className="admin-login-form" onSubmit={handleLogin}>
                  <label className="admin-form-field">
                    <span>User ID</span>
                    <input
                      autoComplete="username"
                      maxLength="100"
                      name="username"
                      onChange={(event) => setUsername(event.target.value)}
                      required
                      value={username}
                    />
                  </label>
                  <label className="admin-form-field">
                    <span>Password</span>
                    <input
                      autoComplete="current-password"
                      maxLength="256"
                      name="password"
                      required
                      type="password"
                    />
                  </label>
                  {authMessage && <p className="admin-auth-error" role="alert">{authMessage}</p>}
                  <button className="admin-save-button" type="submit">Sign in</button>
                </form>
              )}
              <a className="admin-auth-back" href="/">Back to portfolio</a>
            </>
          )}
        </section>
      </main>
    );
  }

  const sections = [
    {
      id: "profile",
      title: "Profile",
      description: "Your introduction, contact details, and public-facing profile.",
      count: "01",
      href: "#profile",
    },
    {
      id: "projects",
      title: "Projects",
      description: "Selected work and the stories you share with interviewers.",
      count: String(portfolio.projects.length).padStart(2, "0"),
      href: "#projects",
    },
    {
      id: "experience",
      title: "Experience",
      description: "Roles, milestones, and experience shown on your portfolio.",
      count: String(portfolio.experience.length).padStart(2, "0"),
      href: "#experience",
    },
    {
      id: "certifications",
      title: "Certifications",
      description: "Upload certificate images or PDFs and share verification links.",
      count: String((portfolio.certifications || []).length).padStart(2, "0"),
      href: "#certifications",
    },
    {
      id: "messages",
      title: "Messages",
      description: "Contact form submissions are stored in your SQL Server database.",
      count: "SQL",
      href: "/#contact",
      action: "View contact form",
    },
  ];

  return (
    <div className="admin-app">
      <AdminNavbar onLogout={handleLogout} />
      <main className="admin-main">
        <section aria-labelledby="admin-title" className="admin-overview" id="dashboard">
          <p className="admin-eyebrow">PORTFOLIO CONTROL CENTER</p>
          <h1 id="admin-title">Welcome to your workspace.</h1>
          <p className="admin-intro">
            A quick overview of the content in your interview portfolio.
          </p>
          <div className="admin-stats" aria-label="Portfolio content overview">
            <article className="admin-stat">
              <span>PROJECTS</span>
              <strong>{String(portfolio.projects.length).padStart(2, "0")}</strong>
            </article>
            <article className="admin-stat">
              <span>EXPERIENCE ENTRIES</span>
              <strong>{String(portfolio.experience.length).padStart(2, "0")}</strong>
            </article>
            <article className="admin-stat">
              <span>CONTACT</span>
              <strong className="admin-stat-label">CONNECTED</strong>
            </article>
          </div>
        </section>
        <section aria-labelledby="sections-title" className="admin-sections">
          <div className="admin-section-heading">
            <div>
              <p className="admin-eyebrow">YOUR PORTFOLIO</p>
              <h2 id="sections-title">Content overview</h2>
            </div>
            <a className="admin-preview-link" href="/">
              View live portfolio <ArrowIcon diagonal />
            </a>
          </div>
          <div className="admin-content-grid">
            {sections.map((section) => (
              <article className="admin-content-card" key={section.id}>
                <div className="admin-card-topline">
                  <span>{section.title}</span>
                  <span className="admin-card-count">{section.count}</span>
                </div>
                <p>{section.description}</p>
                <a href={section.href}>
                  {section.action || `Edit ${section.title.toLowerCase()}`} <ArrowIcon diagonal />
                </a>
              </article>
            ))}
          </div>
        </section>
        <AdminContentEditor data={portfolio} onSave={onSave} />
        <p className="admin-demo-note">
          Signed in as {username || "Admin"}. Portfolio content edits are stored in this browser only.
        </p>
      </main>
    </div>
  );
}
