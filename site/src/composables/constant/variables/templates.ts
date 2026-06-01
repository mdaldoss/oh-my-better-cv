import { PREVIEW_SELECTOR } from "./render";
import { DEFAULT_MD_CONTENT, DEFAULT_CSS_CONTENT, DEFAULT_STYLES } from "./default";
import type { ResumeStyles } from "../../stores/style";

export type ResumeTemplate = {
  /** Unique template id */
  id: string;
  /** Human readable name */
  name: string;
  /** Short description shown in the template picker */
  description: string;
  /** Starter Markdown content */
  markdown: string;
  /** Backbone CSS */
  css: string;
  /** Default styles */
  styles: ResumeStyles;
};

/**
 * Styles for the Swiss / International template.
 *
 * Uses a clean sans-serif (Euclid, bundled locally) and a conservative
 * corporate blue, which reads well for the Swiss and wider European market.
 */
export const SWISS_STYLES: ResumeStyles = {
  marginV: 48,
  marginH: 50,
  lineHeight: 1.35,
  paragraphSpace: 13,
  themeColor: "#1f4e79",
  fontCJK: {
    name: "华康宋体",
    fontFamily: "HKST"
  },
  fontEN: {
    name: "Euclid"
  },
  fontSize: 14,
  paper: "A4"
};

/**
 * Starter content for the Swiss / International template.
 *
 * It encodes the conventions hiring managers in Switzerland and the wider
 * international market expect: a clear target title, a short profile,
 * reverse-chronological experience with location + dates, and an explicit
 * Languages section with CEFR levels.
 */
export const SWISS_MD_CONTENT = `---
name: Anna Müller
header:
  - text: |
      <span style="font-size: 1.05em; font-weight: 600;">Senior Product Manager</span>
  - text: <span class="iconify" data-icon="tabler:phone"></span> (+41) 79 123 45 67
    newLine: true
  - text: <span class="iconify" data-icon="tabler:mail"></span> anna.mueller@email.com
    link: mailto:anna.mueller@email.com
  - text: <span class="iconify" data-icon="tabler:map-pin"></span> Zürich, Switzerland
  - text: <span class="iconify" data-icon="tabler:brand-linkedin"></span> linkedin.com/in/annamueller
    link: https://linkedin.com/in/annamueller
    newLine: true
  - text: <span class="iconify" data-icon="tabler:world"></span> Swiss / EU citizen
---

<!-- Replace every field with your own details. -->
<!-- Tip: in Switzerland a Languages section with CEFR levels (A1–C2) is expected. -->
<!-- A photo, date of birth and nationality are optional and increasingly omitted for international roles. -->


## Profile

Senior Product Manager with 8+ years of experience leading cross-functional teams and shipping B2B SaaS products in regulated industries. Track record of growing ARR, improving retention and delivering data-driven roadmaps. Trilingual (DE / EN / FR), comfortable in international and matrixed organisations.


## Key Skills

**Product:** Roadmapping, Continuous Discovery, OKRs, A/B Testing, Pricing & Packaging
**Leadership:** Cross-functional Team Leadership, Stakeholder Management, Agile / Scrum
**Technical:** SQL, Figma, Jira, Amplitude, REST APIs
**Domains:** FinTech, Healthcare, Enterprise SaaS


## Professional Experience

**Senior Product Manager**, Helvetia Tech AG
  ~ Zürich, CH
  ~ 03/2021 – Present

- Led a team of 6 to launch a new B2B analytics platform, reaching **CHF 4M ARR** within 18 months
- Increased net revenue retention from 98% to **121%** through data-driven onboarding and pricing experiments
- Defined and executed the product strategy across 3 squads, aligning engineering, design and go-to-market

**Product Manager**, Alpine Digital GmbH
  ~ Bern, CH
  ~ 08/2017 – 02/2021

- Owned the core payments product used by **200k+ monthly active users** across the DACH region
- Shipped 40+ releases at a 99.95% uptime SLA, reducing checkout drop-off by **23%**
- Introduced continuous discovery, cutting time-to-validation from 6 weeks to 10 days


## Education

**MSc in Management, Technology and Economics (MTEC)**, ETH Zürich
  ~ Zürich, CH
  ~ 2015 – 2017

**BSc in Computer Science**, University of Geneva
  ~ Geneva, CH
  ~ 2012 – 2015


## Languages

German
  ~ Native

English
  ~ C2 — Fluent

French
  ~ C1 — Professional

Italian
  ~ A2 — Basic


## Certifications

- Professional Scrum Product Owner (PSPO II), Scrum.org — 2022
- Pragmatic Institute: Foundations & Focus — 2019

<!-- References and reference letters (Arbeitszeugnisse) available upon request. -->
`;

/**
 * Backbone CSS for the Swiss / International template. A modern, left-aligned,
 * sans-serif layout. Theme color, font and spacing are still controlled by the
 * toolbar (injected separately by the dynamic CSS service).
 */
export const SWISS_CSS_CONTENT = `/* Backbone CSS for the Swiss / International template */

/* Page */

${PREVIEW_SELECTOR} [data-scope="vue-smart-pages"][data-part="page"] {
  background-color: white;
  color: #1a1a1a;
  text-align: left;
}

${PREVIEW_SELECTOR} p,
${PREVIEW_SELECTOR} li,
${PREVIEW_SELECTOR} dl {
  margin: 0;
}

/* Headings */

${PREVIEW_SELECTOR} h1,
${PREVIEW_SELECTOR} h2,
${PREVIEW_SELECTOR} h3 {
  font-weight: 700;
}

${PREVIEW_SELECTOR} h1 {
  font-size: 2em;
  letter-spacing: -0.01em;
}

${PREVIEW_SELECTOR} h2 {
  font-size: 0.95em;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-bottom-style: solid;
  border-bottom-width: 1.5px;
  padding-bottom: 3px;
  margin-bottom: 8px;
}

${PREVIEW_SELECTOR} h3 {
  font-size: 1.05em;
  margin-bottom: 2px;
}

/* Lists */

${PREVIEW_SELECTOR} ul,
${PREVIEW_SELECTOR} ol {
  padding-left: 1.1em;
  margin: 0.25em 0;
}

${PREVIEW_SELECTOR} ul {
  list-style-type: disc;
}

${PREVIEW_SELECTOR} ol {
  list-style-type: decimal;
}

${PREVIEW_SELECTOR} li {
  margin: 0.12em 0;
}

/* Entry headers: "Role, Company  |  Location  |  Dates" */

${PREVIEW_SELECTOR} dl {
  display: flex;
  gap: 0.6em;
  margin-top: 0.55em;
}

${PREVIEW_SELECTOR} dl dt,
${PREVIEW_SELECTOR} dl dd:not(:last-child) {
  flex: 1;
}

${PREVIEW_SELECTOR} dl dd {
  color: #555;
}

${PREVIEW_SELECTOR} dl dd:last-child {
  white-space: nowrap;
}

/* Tex */

${PREVIEW_SELECTOR} :not(span.katex-display) > span.katex {
  font-size: 1em !important;
}

/* SVG & Images */

${PREVIEW_SELECTOR} svg.iconify {
  vertical-align: -0.2em;
}

${PREVIEW_SELECTOR} img {
  max-width: 100%;
}

/* Header (left aligned, modern) */

${PREVIEW_SELECTOR} .resume-header {
  text-align: left;
  margin-bottom: 6px;
}

${PREVIEW_SELECTOR} .resume-header h1 {
  text-align: left;
  line-height: 1.1;
  margin-bottom: 4px;
}

${PREVIEW_SELECTOR} .resume-header-item:not(.no-separator)::after {
  content: " | ";
  color: #999;
}

/* Citations */

${PREVIEW_SELECTOR} [data-scope="cross-ref"][data-part="definitions"] {
  padding-left: 1.2em;
}

${PREVIEW_SELECTOR} [data-scope="cross-ref"][data-part="definition"] p {
  margin-left: 0.5em;
}

${PREVIEW_SELECTOR} [data-scope="cross-ref"][data-part="definition"]::marker {
  content: attr(data-label);
}

${PREVIEW_SELECTOR} [data-scope="cross-ref"][data-part="reference"] {
  font-size: 100%;
  top: 0;
}

/* Dark & print mode */

.dark ${PREVIEW_SELECTOR} [data-scope="vue-smart-pages"][data-part="page"] {
  background-color: hsl(213, 12%, 15%);
  color: hsl(216, 12%, 84%);
}

.dark ${PREVIEW_SELECTOR} dl dd {
  color: hsl(216, 10%, 65%);
}

@media print {
  .dark ${PREVIEW_SELECTOR} [data-scope="vue-smart-pages"][data-part="page"] {
    background-color: white;
    color: black;
  }

  .dark ${PREVIEW_SELECTOR} dl dd {
    color: #555;
  }
}
`;

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: "classic",
    name: "Classic",
    description:
      "The original academic-friendly layout: serif, justified, great for CVs with publications.",
    markdown: DEFAULT_MD_CONTENT,
    css: DEFAULT_CSS_CONTENT,
    styles: DEFAULT_STYLES
  },
  {
    id: "swiss",
    name: "Swiss / International",
    description:
      "Clean sans-serif layout tuned for the Swiss and international market, with a Languages (CEFR) section.",
    markdown: SWISS_MD_CONTENT,
    css: SWISS_CSS_CONTENT,
    styles: SWISS_STYLES
  }
];

export const DEFAULT_TEMPLATE_ID = "classic";

export const getTemplate = (id: string): ResumeTemplate | undefined =>
  RESUME_TEMPLATES.find((t) => t.id === id);
