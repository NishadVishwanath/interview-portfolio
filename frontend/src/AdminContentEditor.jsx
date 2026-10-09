import { useEffect, useState } from "react";

const MAX_IMAGE_SIZE = 350 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_CERTIFICATE_SIZE = 1024 * 1024;
const CERTIFICATE_TYPES = new Set([...IMAGE_TYPES, "application/pdf"]);

function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

function ImageField({ image, label, onChange }) {
  const [error, setError] = useState("");

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!IMAGE_TYPES.has(file.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Choose an image smaller than 350 KB to save it in this browser.");
      return;
    }

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error || new Error("Could not read image."));
        reader.readAsDataURL(file);
      });
      onChange(dataUrl);
      setError("");
    } catch {
      setError("This image could not be read. Please try another file.");
    }
  }

  return (
    <div className="admin-image-field">
      <span className="admin-field-label">{label}</span>
      <div className="admin-image-controls">
        {image && <img alt={`${label} preview`} className="admin-image-preview" src={image} />}
        <label className="admin-image-picker">
          {image ? "Replace image" : "Upload image"}
          <input
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
            type="file"
          />
        </label>
        {image && (
          <button className="admin-remove-image" onClick={() => onChange("")} type="button">
            Remove image
          </button>
        )}
      </div>
      <span className="admin-field-hint">JPG, PNG, or WebP · max 350 KB</span>
      {error && <span className="admin-field-error" role="alert">{error}</span>}
    </div>
  );
}

function CertificateFileField({ file, fileName, onChange }) {
  const [error, setError] = useState("");

  async function handleFile(event) {
    const uploadedFile = event.target.files?.[0];
    event.target.value = "";
    if (!uploadedFile) return;

    if (!CERTIFICATE_TYPES.has(uploadedFile.type)) {
      setError("Choose a JPG, PNG, WebP, or PDF certificate.");
      return;
    }
    if (uploadedFile.size > MAX_CERTIFICATE_SIZE) {
      setError("Choose a certificate smaller than 1 MB.");
      return;
    }

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error || new Error("Could not read file."));
        reader.readAsDataURL(uploadedFile);
      });
      onChange({
        file: dataUrl,
        fileName: uploadedFile.name,
        fileType: uploadedFile.type,
      });
      setError("");
    } catch {
      setError("This certificate could not be read. Please try another file.");
    }
  }

  return (
    <div className="admin-image-field">
      <span className="admin-field-label">Certificate file</span>
      <div className="admin-image-controls">
        {file && (
          <a className="admin-certificate-file-link" href={file} rel="noreferrer" target="_blank">
            {fileName || "View uploaded certificate"}
          </a>
        )}
        <label className="admin-image-picker">
          {file ? "Replace file" : "Upload certificate"}
          <input accept="image/jpeg,image/png,image/webp,application/pdf" onChange={handleFile} type="file" />
        </label>
        {file && (
          <button
            className="admin-remove-image"
            onClick={() => onChange({ file: "", fileName: "", fileType: "" })}
            type="button"
          >
            Remove file
          </button>
        )}
      </div>
      <span className="admin-field-hint">JPG, PNG, WebP, or PDF · max 1 MB</span>
      {error && <span className="admin-field-error" role="alert">{error}</span>}
    </div>
  );
}

function EditorActions({ message, onCancel }) {
  return (
    <div className="admin-editor-actions">
      <p aria-live="polite" className="admin-editor-status" role="status">{message}</p>
      {onCancel && (
        <button className="admin-secondary-button" onClick={onCancel} type="button">
          Discard changes
        </button>
      )}
      <button className="admin-save-button" type="submit">Save changes</button>
    </div>
  );
}

function TextField({ label, value, onChange, multiline = false, required = true, maxLength, type = "text" }) {
  const controlProps = {
    maxLength,
    onChange: (event) => onChange(event.target.value),
    required,
    value: value ?? "",
  };

  return (
    <label className="admin-form-field">
      <span>{label}</span>
      {multiline ? <textarea rows="3" {...controlProps} /> : <input type={type} {...controlProps} />}
    </label>
  );
}

export default function AdminContentEditor({ data, onSave }) {
  const [profile, setProfile] = useState(() => copy(data.profile));
  const [projects, setProjects] = useState(() => copy(data.projects));
  const [experience, setExperience] = useState(() => copy(data.experience));
  const [certifications, setCertifications] = useState(() => copy(data.certifications || []));
  const [profileMessage, setProfileMessage] = useState("");
  const [projectMessage, setProjectMessage] = useState("");
  const [experienceMessage, setExperienceMessage] = useState("");
  const [certificationMessage, setCertificationMessage] = useState("");

  useEffect(() => setProfile(copy(data.profile)), [data.profile]);
  useEffect(() => setProjects(copy(data.projects)), [data.projects]);
  useEffect(() => setExperience(copy(data.experience)), [data.experience]);
  useEffect(() => setCertifications(copy(data.certifications || [])), [data.certifications]);

  function saveSection(section, value, setMessage) {
    try {
      onSave({ ...data, [section]: value });
      setMessage("Saved in this browser. Your public portfolio is updated.");
    } catch (error) {
      console.error(`Could not save portfolio ${section}.`, error);
      setMessage("Save failed. Browser storage may be full; remove an image and try again.");
    }
  }

  function updateEntry(setEntries, index, field, value) {
    setEntries((entries) =>
      entries.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: value } : entry,
      ),
    );
  }

  return (
    <div className="admin-editors">
      <section aria-labelledby="profile-editor-title" className="admin-editor" id="profile">
        <div className="admin-editor-heading">
          <div>
            <p className="admin-eyebrow">YOUR DETAILS</p>
            <h2 id="profile-editor-title">Edit profile</h2>
          </div>
          <span className="admin-card-count">PROFILE</span>
        </div>
        <form
          className="admin-editor-form"
          onSubmit={(event) => {
            event.preventDefault();
            saveSection("profile", profile, setProfileMessage);
          }}
        >
          <div className="admin-fields-grid">
            <TextField label="Name" maxLength={100} value={profile.name} onChange={(value) => setProfile({ ...profile, name: value })} />
            <TextField label="Role or introduction" maxLength={160} value={profile.role} onChange={(value) => setProfile({ ...profile, role: value })} />
            <TextField label="Headline" maxLength={120} value={profile.headline} onChange={(value) => setProfile({ ...profile, headline: value })} />
            <TextField label="Primary email" maxLength={254} type="email" value={profile.email} onChange={(value) => setProfile({ ...profile, email: value })} />
            <TextField label="Secondary email (optional)" maxLength={254} required={false} type="email" value={profile.secondaryEmail} onChange={(value) => setProfile({ ...profile, secondaryEmail: value })} />
            <TextField label="About you" multiline maxLength={1000} value={profile.about} onChange={(value) => setProfile({ ...profile, about: value })} />
            <ImageField
              image={profile.image}
              label="Profile image"
              onChange={(image) => setProfile({ ...profile, image })}
            />
          </div>
          <EditorActions message={profileMessage} />
        </form>
      </section>

      <section aria-labelledby="projects-editor-title" className="admin-editor" id="projects">
        <div className="admin-editor-heading">
          <div>
            <p className="admin-eyebrow">SELECTED WORK</p>
            <h2 id="projects-editor-title">Edit projects</h2>
          </div>
          <button
            className="admin-secondary-button"
            onClick={() => setProjects((items) => [...items, {
              number: String(items.length + 1).padStart(2, "0"),
              title: "",
              type: "PROJECT",
              description: "",
              tags: [],
              visual: "visual-lavender",
              mark: "NEW PROJECT",
              image: "",
            }])}
            type="button"
          >
            Add project
          </button>
        </div>
        <form
          className="admin-entries"
          onSubmit={(event) => {
            event.preventDefault();
            saveSection("projects", projects, setProjectMessage);
          }}
        >
          {projects.map((project, index) => (
            <article className="admin-entry-editor" key={`${project.number}-${index}`}>
              <div className="admin-entry-heading">
                <h3>Project {String(index + 1).padStart(2, "0")}</h3>
                <button
                  aria-label={`Remove project ${index + 1}`}
                  className="admin-remove-image"
                  disabled={projects.length === 1}
                  onClick={() => setProjects((items) => items.filter((_, itemIndex) => itemIndex !== index))}
                  type="button"
                >
                  Remove project
                </button>
              </div>
              <div className="admin-fields-grid">
                <TextField label="Project name" maxLength={120} value={project.title} onChange={(value) => updateEntry(setProjects, index, "title", value)} />
                <TextField label="Category" maxLength={100} value={project.type} onChange={(value) => updateEntry(setProjects, index, "type", value)} />
                <TextField label="Description" multiline maxLength={600} value={project.description} onChange={(value) => updateEntry(setProjects, index, "description", value)} />
                <TextField label="Skills or tags (comma-separated)" required={false} maxLength={200} value={(project.tags || []).join(", ")} onChange={(value) => updateEntry(setProjects, index, "tags", value.split(",").map((tag) => tag.trim()).filter(Boolean))} />
                <ImageField image={project.image} label="Project image" onChange={(image) => updateEntry(setProjects, index, "image", image)} />
              </div>
            </article>
          ))}
          <EditorActions
            message={projectMessage}
            onCancel={() => setProjects(copy(data.projects))}
          />
        </form>
      </section>

      <section aria-labelledby="experience-editor-title" className="admin-editor" id="experience">
        <div className="admin-editor-heading">
          <div>
            <p className="admin-eyebrow">YOUR JOURNEY</p>
            <h2 id="experience-editor-title">Edit experience</h2>
          </div>
          <button
            className="admin-secondary-button"
            onClick={() => setExperience((items) => [...items, {
              date: "",
              title: "",
              organization: "",
              description: "",
              image: "",
            }])}
            type="button"
          >
            Add experience
          </button>
        </div>
        <form
          className="admin-entries"
          onSubmit={(event) => {
            event.preventDefault();
            saveSection("experience", experience, setExperienceMessage);
          }}
        >
          {experience.map((item, index) => (
            <article className="admin-entry-editor" key={`${item.title}-${index}`}>
              <div className="admin-entry-heading">
                <h3>Experience {String(index + 1).padStart(2, "0")}</h3>
                <button
                  aria-label={`Remove experience ${index + 1}`}
                  className="admin-remove-image"
                  disabled={experience.length === 1}
                  onClick={() => setExperience((items) => items.filter((_, itemIndex) => itemIndex !== index))}
                  type="button"
                >
                  Remove entry
                </button>
              </div>
              <div className="admin-fields-grid">
                <TextField label="Dates" maxLength={60} value={item.date} onChange={(value) => updateEntry(setExperience, index, "date", value)} />
                <TextField label="Role or title" maxLength={120} value={item.title} onChange={(value) => updateEntry(setExperience, index, "title", value)} />
                <TextField label="Organization" maxLength={140} value={item.organization} onChange={(value) => updateEntry(setExperience, index, "organization", value)} />
                <TextField label="Description" multiline maxLength={600} value={item.description} onChange={(value) => updateEntry(setExperience, index, "description", value)} />
                <ImageField image={item.image} label="Experience image (optional)" onChange={(image) => updateEntry(setExperience, index, "image", image)} />
              </div>
            </article>
          ))}
          <EditorActions
            message={experienceMessage}
            onCancel={() => setExperience(copy(data.experience))}
          />
        </form>
      </section>

      <section aria-labelledby="certifications-editor-title" className="admin-editor" id="certifications">
        <div className="admin-editor-heading">
          <div>
            <p className="admin-eyebrow">LEARNING & CREDENTIALS</p>
            <h2 id="certifications-editor-title">Edit certifications</h2>
          </div>
          <button
            className="admin-secondary-button"
            onClick={() => setCertifications((items) => [...items, {
              title: "",
              issuer: "",
              date: "",
              credentialUrl: "",
              file: "",
              fileName: "",
              fileType: "",
            }])}
            type="button"
          >
            Add certification
          </button>
        </div>
        <form
          className="admin-entries"
          onSubmit={(event) => {
            event.preventDefault();
            saveSection("certifications", certifications, setCertificationMessage);
          }}
        >
          {certifications.length === 0 && (
            <p className="admin-certification-empty">No certifications added yet. Add one to display it on your public portfolio.</p>
          )}
          {certifications.map((certificate, index) => (
            <article className="admin-entry-editor" key={`certificate-${index}`}>
              <div className="admin-entry-heading">
                <h3>Certification {String(index + 1).padStart(2, "0")}</h3>
                <button
                  aria-label={`Remove certification ${index + 1}`}
                  className="admin-remove-image"
                  onClick={() => setCertifications((items) => items.filter((_, itemIndex) => itemIndex !== index))}
                  type="button"
                >
                  Remove certification
                </button>
              </div>
              <div className="admin-fields-grid">
                <TextField label="Certification name" maxLength={160} value={certificate.title} onChange={(value) => updateEntry(setCertifications, index, "title", value)} />
                <TextField label="Issuing organization" maxLength={140} value={certificate.issuer} onChange={(value) => updateEntry(setCertifications, index, "issuer", value)} />
                <TextField label="Issue date" maxLength={60} required={false} value={certificate.date} onChange={(value) => updateEntry(setCertifications, index, "date", value)} />
                <TextField label="Credential URL (optional)" maxLength={500} required={false} type="url" value={certificate.credentialUrl} onChange={(value) => updateEntry(setCertifications, index, "credentialUrl", value)} />
                <CertificateFileField
                  file={certificate.file}
                  fileName={certificate.fileName}
                  onChange={(values) => setCertifications((items) =>
                    items.map((item, itemIndex) => itemIndex === index ? { ...item, ...values } : item),
                  )}
                />
              </div>
            </article>
          ))}
          <EditorActions
            message={certificationMessage}
            onCancel={() => setCertifications(copy(data.certifications || []))}
          />
        </form>
      </section>
    </div>
  );
}
