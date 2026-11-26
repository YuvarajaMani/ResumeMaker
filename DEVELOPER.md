# Resume Builder: developer guide

How the app is built, how data flows through it, and how to extend it. For what the app does from a user's point of view, see [README.md](README.md).

## At a glance

- **No build step and no dependencies.** Plain HTML, CSS and JavaScript. Node is only used for the small local server.
- **One state object.** The whole resume lives in a single JSON object, `state`. The page is re-rendered from it.
- **Edit in place.** Every editable piece of text is a `contenteditable` element whose `data-path` points into `state`.
- **Print is the PDF engine.** "Download PDF" calls `window.print()`. The print styles in `styles.css` turn the page into clean PDF pages.

## Requirements

- Node.js 20 or newer. Only the standard library is used; there is nothing to `npm install`.
- A Chromium-based browser for development. The CSS uses `:has()`, `color-mix()`, `list-style-type: '<string>'` and `:is()`.

## Running locally

```powershell
npm start
```

Open http://localhost:5173. Stop the server with Ctrl+C; it finishes any save in progress before exiting.

### Settings

All optional, set as environment variables:

| Variable | Default | Meaning |
|---|---|---|
| `PORT` | `5173` | Port to listen on. |
| `HOST` | `127.0.0.1` | Address to listen on. Keep it local: the app has no login and the resume holds personal data. The server warns if you change it. |
| `DATA_DIR` | `C:\Resume` on Windows, `~/Resume` elsewhere | Folder for the resume and its backups. Created if missing. If it can't be written (for example the drive doesn't exist), the server falls back to the project folder and prints an error. |
| `DATA_FILE` | `<DATA_DIR>\resume-data.json` | Where the resume is saved. |
| `BACKUP_DIR` | `<DATA_DIR>\backups` | Where earlier copies of the resume are kept. |
| `BACKUP_KEEP` | `20` | How many backups to keep. `0` turns backups off. |
| `BACKUP_EVERY` | `10` | Minimum minutes between backups. |
| `LOG` | `info` | `info` logs saves and errors; `quiet` logs errors only. |

For example, in PowerShell:

```powershell
$env:PORT = '8080'; npm start
```

You can also open `index.html` straight from disk. Everything works except saving to `resume-data.json`; edits are then kept in the browser's localStorage only.

There is no hot reload: after editing `app.js` or `styles.css`, refresh the browser. After editing `server.js`, restart the server.

`.claude/launch.json` defines the same server for the Claude desktop preview pane.

## Project layout

| File | What it holds |
|---|---|
| `index.html` | App shell: top bar, tool rail, drawer, canvas, modal, hidden file inputs, toast. Loads `styles.css` and `app.js`. |
| `app.js` | The whole app in one IIFE (about 1,850 lines): config, state, history, saving, rendering, pagination, editing, popovers, drawers, ATS preview, resume check, import/export. |
| `styles.css` | Editor UI, the resume page, every template (`.layout-*`), section styles (`.v-*`), bullet and alignment options, and print rules. |
| `server.js` | Local server: serves the three app files and the `/api/resume` and `/api/info` endpoints, with security headers, backups and graceful shutdown. Exports `createServer()` for the tests. |
| `test/server.test.js` | Automated tests for the server, using Node's built-in test runner. |
| `scripts/check.js` | Static checks: syntax of every JS file, and that `index.html` and `app.js` stay within the security policy. |
| `package.json` | npm scripts and the required Node version. |
| `.editorconfig` | Two-space indents, LF line endings, UTF-8. |

The resume itself is **not** in the project. It's saved in `C:\Resume\resume-data.json`, with earlier copies in `C:\Resume\backups\` (see `DATA_DIR` above). Both contain personal data; never commit or share them. Earlier versions of the app saved them in the project folder. On startup, if `C:\Resume` has no resume yet, the server copies the old ones across once, leaves the originals in place, and logs that it did. This only happens for the default location: a folder set with `DATA_DIR` or `DATA_FILE` starts empty, which makes it safe for demos and tests.

When nothing is saved yet (no browser copy and no file), the editor starts with a random made-up resume from `randomResume()`. **Load random example** in Import / export generates a new one. All names, companies and contact details in it are fictional (`example.com` emails, `555` phone numbers).

## Data model

`state` has four parts:

```js
{
  meta:   { name: 'My Resume' },                    // document name shown in the top bar
  header: { name, title, phone, email, link, location, photo, hide?: ['phone', ...] },
  design: { layout, accent, font, headFont, fontSize, lineHeight, sectionGap,
            margin, ratio, heading, showPhoto, pageSize },
  sections: [ Section, ... ]                         // in page order
}
```

A `Section`:

```js
{
  id, type, title,            // type is a key of TYPES
  column: 'left' | 'right',   // used by the two-column templates
  variant,                    // section style, a key from VARIANTS[type]
  items: [ ... ],             // shape depends on type, see TYPES[type].item()
  space,                      // extra px below the section (-16..120)
  itemGap?,                   // px between entries (0..40)
  hide?: ['dates', ...],      // fields hidden for every entry (see FIELDS)
  bullet?,                    // bullet shape, see BULLET_STYLES (default 'disc')
  bulletLayout?,              // 'para' | 'inline' | 'cols' (default 'list')
  align?                      // 'center' | 'right' | 'justify' (default 'left')
}
```

Item shapes come from `TYPES[type].item()`. For example, experience is `{ role, company, dates, location, desc, bullets: [] }`. Skills items are `{ name, rating, list }`: tag styles use `name`, while the category styles (`cats`, `catcols`, `catstack`, `catbullets`) treat each item as a category with `name` as the label and `list` as a comma-separated string.

Optional keys are only stored when they differ from the default, which keeps saved files small.

### `normalize()` is the gatekeeper

Everything that enters `state` from outside (localStorage, `resume-data.json`, an imported JSON file) goes through `normalize()`. It fills in missing fields, drops unknown section types, clamps numbers and validates enums and the photo data URL. **When you add a new stored field, add it to `normalize()` too**, or it will be dropped on the next load.

## How a change flows

1. **Typing** in a `.ce` element fires `input`. The handler writes the text into `state` with `setPath(el.dataset.path, value)`. It does **not** re-render, so the caret is never disturbed. It schedules a save and a page-break check.
2. **Structural changes** (add, delete, move, change a style) go through `mutate(fn)`. It pushes an undo snapshot, runs `fn` to change `state`, then calls `render()`.
3. **`render()`** rebuilds `#page` from `state`: it sets CSS variables for the design, builds each section with `sectionHTML()` and `itemHTML()`, then re-paginates, updates the top bar and schedules a save.
4. **Undo and redo** keep JSON snapshots in `past` and `future` (up to 150). A burst of typing counts as one undo step (`beginTyping()`).

Rule of thumb: never edit `state` and call `render()` by hand for user actions. Use `mutate()` so the action can be undone.

## Rendering

- `sectionHTML(sec, si, twoCol)` outputs one `<section class="sec sec-<type> v-<variant> b-<bullet> bl-<layout> al-<align>">` with its hover toolbar, title and body.
- `ITEM[type](basePath, item)` returns the inner HTML for one entry of that type.
- `ce(path, placeholder, className, opts)` returns an editable element. It returns nothing when that field is hidden in the section's `hide` list. Options: `multi` (allows line breaks) and `kind` (`'bullet'`, `'tag'`, `'catlist'`), which controls what Enter and Backspace do.
- Empty optional fields are hidden with CSS until the entry has focus (see "Clean editing" in `styles.css`). Empty bullets are only shown while being typed in.

### Pagination

The editor shows real page sheets. `paginate()` measures entries, tag blocks, headings and, for very tall entries, bullet lines. Anything that would cross the bottom margin is pushed onto the next sheet, either with a `margin-top` or with an inserted `.pspacer` element. Headings always move together with their first entry. `updateBreaks()` runs it and updates the page count; `scheduleBreaks()` debounces it while typing. Screen, Preview and PDF all break in the same places.

## Saving

All of this lives in the "Persistence" part of `app.js` and in `server.js`.

- `scheduleSave()` waits 400 ms after the last change, then `saveNow()` writes:
  - localStorage key `resumebuilder.state.v1`, plus `resumebuilder.state.v1.savedAt`
  - `PUT /api/resume` with `{ savedAt, state }`, which the server writes to `resume-data.json`
- Pending saves are flushed on `pagehide` and when the tab becomes hidden, using `fetch(..., { keepalive: true })`.
- On startup, `syncWithDisk()` loads the file copy if it is newer than the browser copy, or pushes the browser copy to disk if that one is newer.
- The **Save** button and Ctrl+S call `saveNow(false, true)`, which writes even if nothing changed. Clicking the save status opens a panel that shows the file path (from `/api/info`) and the last save times.

### Server API

| Method | Path | Behavior |
|---|---|---|
| `GET` | `/api/resume` | 200 with the saved JSON, or 204 if no file exists yet. |
| `PUT` / `POST` | `/api/resume` | Saves `{ savedAt, state }`. Returns 200 on success, or 409 (with the stored copy) if the stored `savedAt` is newer. Errors: 403 without the `X-Resume-Builder: 1` header or from a non-local `Origin`, 415 if the body isn't `application/json`, 413 above 25 MB, 400 for invalid JSON, a body that isn't a resume, or a `savedAt` more than a day in the future. |
| `GET` | `/api/info` | `{ file, exists, size, modified }` for the data file. |
| `GET` | `/`, `/index.html`, `/styles.css`, `/app.js` | The app files, with an `ETag` so unchanged files come back as 304. |
| any | anything else | 404. `/favicon.ico` gets an empty 204. |

Every response carries the security headers listed below.

### How saving stays safe

- **Atomic writes:** each save goes to a temporary file that is then renamed over `resume-data.json`, so a crash never leaves a half-written file.
- **One write at a time:** saves are queued, so two quick saves can't interleave.
- **No stale overwrites:** the 409 rule means an old tab can't replace newer edits.
- **Backups:** before replacing the file, the server copies the previous version into `backups/` (at most once every `BACKUP_EVERY` minutes) and keeps the newest `BACKUP_KEEP` copies. To restore one, stop the server and copy it over `resume-data.json`, or use Import / export in the app.
- **Two tabs:** if another tab saves the resume, the app warns you to reload before editing.

### Security

The server is meant for one person on their own computer.

- It listens on `127.0.0.1` only by default.
- It answers only requests whose `Host` is `localhost`, `127.0.0.1` or `[::1]`, and returns 421 for anything else. This blocks DNS rebinding, where another website points its own domain at your machine to read the resume.
- Writes need the custom `X-Resume-Builder: 1` header from a local `Origin`. Browsers can't send that header cross-origin without a CORS preflight, which the server never approves, so other websites can't write to the file.
- Security headers on every response:
  - a strict Content-Security-Policy: scripts only from this server, styles from this server and Google Fonts, fonts from Google Fonts, images from this server or `data:`/`blob:`, no framing
  - `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`
  - same-origin opener and resource policies, and a Permissions-Policy that turns off camera, microphone, location and payment
- Only the three app files are served. Source files such as `server.js`, the data file and backups can't be downloaded.
- Requests time out after 30 seconds.

Because of the Content-Security-Policy, `index.html` must not contain inline `<script>` blocks or `on...=` attributes, and `app.js` must not use `eval`. `npm run check` enforces this.

## UI building blocks

- **Hover toolbars:** `.sec-tools` for sections, `.item-tools` for entries and `.head-tools` for the header. Their buttons carry `data-act="..."` and are handled in `onPageAction(act, btn)`, which also resolves the section index `si` and item index `ii` from the closest `[data-s]` and `[data-i]` attributes.
- **Popovers:** a single floating `pop` element at a time. `openStylePop()` builds the Style panel (tabs: Styles, Text, Bullets, Spacing). `openFieldsPop()` and `openHeadPop()` build the show/hide field switches. Clicks inside are handled by the document-level click listener (`data-variant`, `data-align`, `data-blayout`, `data-bullet`, `data-secreset`, `data-pstab`). The `data-showfield` switches are handled by a `change` listener.
- **Drawers:** the left rail opens `#drawer`. Each panel is a function in `DRAWERS`; its title is in `PANELS`. `renderDrawer()` re-runs the open one after each render.
- **Template thumbnails:** `thumb(id)` draws the small preview in the Templates drawer.
- **Style picture cards:** `SKETCH[variantId]` is a tiny wireframe description, drawn by `sketch()`. The format is in the comment above `SKETCH`.
- **Icons:** inline SVG strings in the `I` object. `data-icon="name"` in `index.html` is filled in on startup.

## Common tasks

### Add a template

1. Add an entry to `LAYOUTS`: `{ id, group: 'single' | 'two', name, desc, heading, datesRight?, font? }`.
2. Add its styles in `styles.css` under `.layout-<id> ...`.
3. Add a thumbnail case for the id in `thumb()`.
4. A two-column template must also be added to `isTwoCol()`, which lists those template ids. Look at how `double` and `sidebar` are handled in `render()` and the CSS.

### Add a style to a section type

1. Add `[id, 'Name', 'Description']` to `VARIANTS[type]`.
2. Style it in `styles.css` with `.v-<id> ...`.
3. Add a wireframe to `SKETCH` so the Style panel shows a picture.
4. If the style needs a different data shape, convert the data in `setVariant()`. The skills category styles are an example.

### Add a section type

1. Add it to `TYPES` with `label`, `hint`, `title`, default `col`, the field to `focus` when added, and an `item()` factory.
2. Add its renderer to `ITEM`.
3. Add its styles to `VARIANTS` (at least one), its optional fields to `ENTRY_ONLY`, and wireframes to `SKETCH`.
4. Handle it in `atsSectionLines()` (ATS preview text) and, if it matters for scoring, in `runChecks()`.

### Add a per-section setting

Follow `align` as the model:

1. Store it on the section only when it differs from the default.
2. Validate it in `normalize()`.
3. Add a class in `sectionHTML()` and style that class in `styles.css`.
4. Add the control to `openStylePop()` and its click branch to the popover click listener, using `mutate()`.

## Print and PDF

- `@media print` and `.page.is-print` rules hide every editing aid: toolbars, placeholders, empty fields, `+` buttons and the tag remove buttons. Any new editor-only element must be hidden in both places.
- `beforeprint` and `afterprint` switch the page into its print layout so `paginate()` measures without the gaps between sheets.
- The `@page` size comes from `PAGE_SIZES[design.pageSize].css`.

## Testing

Run everything before you finish a change:

```powershell
npm run verify
```

That runs both of these:

| Command | What it does |
|---|---|
| `npm run check` | Static checks: every JS file parses; `index.html` only loads files the server serves and has no inline scripts; `app.js` has no `eval` or leftover `console.log`. |
| `npm test` | Server tests in `test/` using Node's built-in runner: static files and headers, 304s, 404s, the host check, write protection, validation, saving, stale-save rejection, 20 saves at once, backup pruning and unsupported methods. Each run uses a temporary folder, so your real resume is never touched. |

The editor itself (`app.js`) has no automated tests. Check editor changes by hand in the browser:

- Edit text, add and remove entries, bullets, tags and categories, then undo and redo.
- Switch templates and section styles. Check Preview and the print dialog (Download PDF).
- Reload the page and confirm the edits are still there. Clear localStorage and reload to check that the file copy loads.
- Watch the browser console for errors. Unexpected errors are logged there as `Resume Builder error:`, and the user sees a one-time message.

## Conventions

- No frameworks and no dependencies. Keep it that way unless there is a strong reason.
- Escape every user string that goes into HTML with `esc()`. `contenteditable` elements get their text through `ce()`, which escapes it.
- Keep user-facing text short and plain. Labels use sentence case.
- Comment the *why*, not the *what*.
