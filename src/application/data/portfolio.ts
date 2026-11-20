// Everything personal on the site lives here: the projects that become rocks
// in the shaft, and the contact rocks at its bottom.
export type Spot = { text: string; subtitle?: string; url?: string; x: number; y: number };

export const owner = {
  name: "Juan Fernando Agudelo",
  github: "https://github.com/Juan-Fer-Agudelo",
  linkedin: "https://www.linkedin.com/in/juan-fer-agudelo-861b13264/",
  email: "juan.fernando.arch@gmail.com",
};

// The order is the order you meet them: along the corridor of the second
// level, from right to left, then down the shaft in two columns.
export const projects: Spot[] = [
  { text: "ENHANCE.WORK", subtitle: "Plataforma de empleo - Stripe", url: "https://enhance.work", x: 22, y: -3.5 },
  { text: "PERFECT B", subtitle: "Clínica estética - Astro y React", url: "https://perfectb.com", x: 18, y: -6.5 },
  { text: "MIAMI BOUNCE", subtitle: "Reservas en línea - React", url: "https://miabounce.com", x: 13, y: -3.5 },
  { text: "PÉPTIDOS VENEZUELA", subtitle: "E-commerce - React", url: "https://peptidosvzla.com", x: 11, y: -10.5 },
  { text: "ESTRUCTURA360", subtitle: "Renault - De 14 horas a minutos", x: 5, y: -10.5 },
  { text: "TRAZABILIDAD DE AGVS", subtitle: "Renault - Mapa en tiempo real", x: 11, y: -13.2 },
  { text: "TASAS DE CAMBIO", subtitle: "Simex - n8n - 130 h ahorradas", x: 5, y: -13.2 },
  { text: "FARMACIAS MASSALUD", subtitle: "Alertas en Slack y ERP", x: 11, y: -17.5 },
  { text: "CONTADORAS AQ", subtitle: "Sitio web - Next.js y SEO", x: 5, y: -17.5 },
];

export const contacts: Spot[] = [
  { text: "LINKEDIN", url: owner.linkedin, x: 5, y: -21 },
  { text: "GITHUB", url: owner.github, x: 11, y: -21 },
  { text: "MAIL", url: `mailto:${owner.email}`, x: 8, y: -23.5 },
];

// The signs painted on the walls of the map, keyed by the mesh they replace.
// Units are arbitrary: each sign is scaled to the width of the original one.
export type SignPiece = {
  text: string;
  x: number;
  y: number;
  size: number;
  align?: "left" | "center" | "right";
  underline?: boolean;
};

const job = (row: number, years: string, role: string, company: string): SignPiece[] => [
  { text: years, x: -0.7, y: -row * 3.3, size: 0.9, align: "right" },
  { text: role, x: 0, y: -row * 3.3, size: 1 },
  { text: company, x: 0, y: -row * 3.3 - 1.3, size: 1 },
];

export const signs: Record<string, { align: "left" | "center"; pieces: SignPiece[] }> = {
  // Upper left wall of the second level: work history.
  Text006: { align: "center", pieces: [{ text: "EXPERIENCIA", x: 0, y: 0, size: 1, align: "center", underline: true }] },
  Text007: {
    align: "center",
    pieces: [
      ...job(0, "2026 - HOY", "FULL-STACK Y ARQUITECTO", "en TALENT PHI"),
      ...job(1, "2025 - 2026", "AUTOMATIZACIÓN", "en SIMEX"),
      ...job(2, "2024 - 2025", "ANALISTA DE DATOS", "en RENAULT SOFASA"),
    ],
  },
  // Wall of the shaft: studies.
  Text004: { align: "left", pieces: [{ text: "EDUCACIÓN", x: 0, y: 0, size: 1, underline: true }] },
  Text005: {
    align: "left",
    pieces: [
      { text: "INGENIERÍA DE SISTEMAS", x: 0, y: 0, size: 1 },
      { text: "TECNÓLOGO EN SISTEMAS", x: 0, y: -1.25, size: 1 },
      { text: "I.U. SALAZAR Y HERRERA", x: 0, y: -3.2, size: 1 },
      { text: "MEDELLÍN, COLOMBIA", x: 0, y: -4.45, size: 1 },
    ],
  },
  // Floor of the deep cavern.
  Text002: {
    align: "left",
    pieces: [
      { text: "MÁS PROYECTOS", x: 0, y: 0, size: 1 },
      { text: "EN CONSTRUCCIÓN", x: 0, y: -1.25, size: 1 },
    ],
  },
};
