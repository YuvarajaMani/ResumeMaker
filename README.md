# Resume Builder

A browser-based, what-you-see-is-what-you-get resume editor. You edit text directly on an A4 page and download it as a PDF. It has no dependencies.

## Run

```
npm start
```

or

```
node server.js
```

Then open http://localhost:5173. You can also open `index.html` directly in a browser, but then edits are saved in that browser only.

Working on the code? See the [developer guide](DEVELOPER.md).

## Features

- **Edit on the page.** Click any text to change it. Press Enter in a bullet to add a new bullet. Press Backspace in an empty bullet to remove it. If you paste a list into a bullet, it splits into separate bullets.
- **Sections:** Summary, Experience, Education, Projects, Skills (tags), Languages (with 1–5 ratings), Certifications, Key Achievements, Strengths, Volunteering, Interests and Custom.
- **Hover toolbars:** add, move or delete entries and sections, add bullets, and move a section to the other column.
- **Rearrange:** drag sections to reorder them or move them between columns.
- **Templates:** 9 single-column templates (Simple, Professional, Executive, Left headings, Timeline, Minimal, Elegant, Classic, ATS plain) and 2 two-column templates (Double column, Sidebar).
- **Section styles:** every section has its own layout options. Pick one from the **Style** button in the section's hover toolbar, or set them all from the list in Design & font.
  - Experience, Education, Projects, Volunteering, Custom: Standard, Compact, Dates on left
  - Skills: Tags, Bullet list, Comma list, Skill bars (1–5)
  - Interests: Tags, Bullet list, Comma list
  - Languages: Dots, Bar, Text only
  - Achievements, Strengths: With icons, Plain, Two-column grid
  - Summary: Paragraph, Callout
  - Certifications: Standard, Compact
- **Section spacing:** each section has its own spacing. Drag the small handle under a section to change the space below it, or use the sliders in its Style menu ("Space below section" and "Space between entries"). Reset spacing returns to the defaults.
- **Clean editing:** empty optional fields, such as a blank company description, stay hidden until you click into that entry.
- **Page view:** you edit directly on separate page sheets, each the size of a printed page, with a gap between them. Pages break exactly where the PDF will. An entry, a tag block or a heading that would be cut across a page moves to the next sheet, and a heading always moves with its first entry. The Sidebar template's colored column is drawn on each sheet.
- **Preview:** the Preview button switches the same view into reading mode. Placeholders, toolbars and outlines are hidden and the text can't be edited. Click Edit, or press Esc, to go back.
- **Page size:** A4, US Letter or US Legal. The page, the page-break guides and the PDF all follow the chosen size.
- **Design & font:** accent color (preset or custom), separate fonts for headings (name, headline, section titles) and body text from 10 choices, heading style, font size, line height, spacing, margins, column width and a profile photo.
- **Resume check:** a live 0–100 score covering contact details, summary length, quantified bullets, action verbs, bullet length, skills, pronouns and page count.
- **Saving:** every edit is saved automatically, both in the browser and in `C:\Resume\resume-data.json`, with automatic backups in `C:\Resume\backups`. The newest copy opens next time. Use the Save button or Ctrl+S to save at once; click the save status to see where it's stored. Undo and redo with Ctrl+Z and Ctrl+Y. Export and import JSON backups.
- **PDF:** "Download PDF" opens the print dialog with A4 print styles. Choose "Save as PDF". Empty placeholders and the editing tools are left out of the PDF.

## Files

- `index.html`: the app shell
- `styles.css`: styles for the app and the resume, including print styles
- `app.js`: state, rendering, editing, panels and the resume check
- `server.js`: a small local server that also saves the resume to `resume-data.json`
- `test/`, `scripts/`: automated tests and checks. Run them with `npm run verify`
- `DEVELOPER.md`: how the code works and how to extend it
