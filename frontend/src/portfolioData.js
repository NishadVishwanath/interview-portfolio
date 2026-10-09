const STORAGE_KEY = "interview-portfolio-content";

export const defaultPortfolioData = {
  profile: {
    name: "Your Name",
    role: "Product-minded creative",
    headline: "Making good ideas happen.",
    intro:
      "A product-minded creative who brings clarity to complex problems and care to the details.",
    about:
      "I'm a curious, collaborative problem-solver who enjoys bringing people together around work that matters. My sweet spot is the space between understanding a need and making something genuinely useful from it.",
    email: "om.vishwanath.1176@gmail.com",
    secondaryEmail: "om.vishwanath.1176@outlook.com",
    image: "",
  },
  projects: [
    {
      number: "01",
      title: "A calmer way to plan",
      type: "PRODUCT CONCEPT · PERSONAL PROJECT",
      description:
        "A lightweight planning experience that helps people turn a long list of tasks into a clear, manageable next step.",
      tags: ["Product design", "React", "Prototyping"],
      visual: "visual-lavender",
      mark: "01 / PLAN",
      image: "",
    },
    {
      number: "02",
      title: "Better questions, better insights",
      type: "RESEARCH CONCEPT · CASE STUDY",
      description:
        "An exploration of how thoughtful prompts and clearer summaries could make feedback more useful to small teams.",
      tags: ["User research", "Content design", "Strategy"],
      visual: "visual-peach",
      mark: "02 / LISTEN",
      image: "",
    },
    {
      number: "03",
      title: "The neighborhood guide",
      type: "WEB CONCEPT · INTERACTIVE DEMO",
      description:
        "A community-first directory concept for finding independent places and sharing recommendations close to home.",
      tags: ["Community", "Web design", "Accessibility"],
      visual: "visual-green",
      mark: "03 / EXPLORE",
      image: "",
    },
  ],
  experience: [
    {
      date: "2023 — NOW",
      title: "Product designer",
      organization: "Your next team · Sample role",
      description:
        "Replace this entry with a real role, organization, and a concise description of your work and its impact.",
      image: "",
    },
    {
      date: "2021 — 2023",
      title: "Design generalist",
      organization: "A previous team · Sample role",
      description:
        "Share the problem you helped solve, who you worked with, and what you learned. Keep details accurate and specific.",
      image: "",
    },
    {
      date: "2020 — 2021",
      title: "Independent projects",
      organization: "Self-directed · Sample entry",
      description:
        "Personal, volunteer, and learning projects count too. Link to the work and make the context clear.",
      image: "",
    },
  ],
  certifications: [
    {
      title: "Sample Certificate of Completion",
      issuer: "Demo Learning Institute",
      date: "October 2026",
      credentialUrl: "",
      file: "",
      fileName: "",
      fileType: "",
      isDemo: true,
    },
  ],
};

export function loadPortfolioData() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultPortfolioData;

    const parsed = JSON.parse(saved);
    const savedProfile = { ...defaultPortfolioData.profile, ...parsed.profile };
    if (savedProfile.email === "hello@example.com") {
      savedProfile.email = defaultPortfolioData.profile.email;
    }
    return {
      profile: savedProfile,
      projects: Array.isArray(parsed.projects) ? parsed.projects : defaultPortfolioData.projects,
      experience: Array.isArray(parsed.experience)
        ? parsed.experience
        : defaultPortfolioData.experience,
      certifications: Array.isArray(parsed.certifications)
        ? parsed.certifications
        : defaultPortfolioData.certifications,
    };
  } catch (error) {
    console.error("Could not load saved portfolio content.", error);
    return defaultPortfolioData;
  }
}

export function savePortfolioData(data) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
