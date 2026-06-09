# Oh My CV!

Microsoft Word and LaTeX are too overkill for a resume.

So, why not write it in Markdown?

Have fun: [ohmycv.app](https://ohmycv.app/)


&nbsp;

## Important Notice

- Highly recommend using **Chromium-based browsers**, e.g., [Chrome](https://www.google.com/chrome/) and [Microsoft Edge](https://www.microsoft.com/en-us/edge).
- **Backup your data**: Cloud backup is coming soon, but isn't available yet. For now, please regularly export and back up your data by clicking the `Save As` button.


&nbsp;

## Features

- **AI CV Tailoring** ✨ — keep one full "master" CV, paste a job description, get a match score + the key skills you're missing, and generate a tailored, ready-to-edit CV in one click (see below)
- Multiple templates, including a clean **Swiss / International** layout (with a CEFR Languages section)
- Write your resume in Markdown and enjoy a real-time preview — it's smooth!
- Export to PDF in A4 and US Letter sizes
- Automatically paginate your resume like in Microsoft Word
- Customize page margins, theme colors, line heights, fonts, and more
- Pick any fonts from [Google Fonts](https://fonts.google.com/)
- Easily add icons using [Iconify](https://github.com/iconify/iconify) (search for icons on [Icônes](https://icones.js.org/))
- Tex support ([KaTeX](https://github.com/KaTeX/KaTeX))
- Add cross-references (ideal for academic CVs)
- Correct casing automatically (e.g., 'Github' to 'GitHub')
- Insert line breaks (`\\[10px]`) or start a new page (`\newpage`) just as you would in LaTeX
- Customize CSS
- Manage multiple resumes
- It works offline ([PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps))
- Your data in your hands:
  - All data is saved locally in your browser (see [here](https://localforage.github.io/localForage/) for details)
  - Hosted on [Github Pages](https://pages.github.com/) as an open-source static website, which doesn't (have the ability to) collect your data
  - No user tracking or ads
- Dark mode


&nbsp;

## AI CV Tailoring

Open **AI Tailor** from the header (`/tailor`):

1. **Keep a reference CV** — paste or upload your complete CV (every role, project, skill). It's stored locally in your browser and reused for every tailored version.
2. **Paste a job description** into the text box.
3. **Evaluate match** — get an honest fit score, the core points the role is really about, the key skills/concepts you're missing (with how to address them), your matching strengths, and ATS keywords.
4. **Create tailored CV** — generate a tailored CV that re-frames and highlights your most relevant experience for the role, **without inventing** anything.
5. **Edit & download** — tweak the Markdown inline, open it in the full editor (it lands on the Swiss template), then export to PDF or download the Markdown.

### Setup

The feature is **local-first**. Open **AI Settings**, pick a provider (**Anthropic** or **OpenRouter**) and paste your API key — it's stored only in your browser and sent directly to the provider. Nothing is sent to any server of ours.

Prefer to keep your key off the browser? There's an optional **Supabase Edge Function proxy** mode that holds the key server-side. See [`supabase/README.md`](supabase/README.md) for the schema and function (the app already has the client wiring — just switch the backend in AI Settings).

&nbsp;

## Contribution

Contributions are welcome. Please read this [Contributing Guide](.github/CONTRIBUTING.md) before getting started. Thanks!


&nbsp;

## Credits

- [billryan/resume](https://github.com/billryan/resume)


&nbsp;

## License

[GPL-3.0](LICENSE)
