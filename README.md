# Spin & Win — Spin Wheel App

A beautiful, fully customizable spin wheel game. Pure HTML/CSS/JS — no build step required.

## Features

- **Smooth spin animation** with easing
- **Customizable segments** — add, remove, rename, change colors
- **Confetti celebration** on result
- **Responsive** — works on mobile & desktop
- **Static files only** — perfect for shared hosting

## Deploy to Hostinger

### Option A: File Manager Upload (Easiest)

1. Log in to your [Hostinger hPanel](https://hpanel.hostinger.com)
2. Go to **Files → File Manager**
3. Navigate to `public_html/` (the web root)
4. Upload all 3 files:
   - `index.html`
   - `styles.css`
   - `script.js`
5. Visit your domain — done!

### Option B: FTP Upload

1. In hPanel, go to **Files → FTP Accounts** and note your credentials
2. Use an FTP client (FileZilla, Cyberduck, etc.)
3. Connect and upload the 3 files to `public_html/`
4. Visit your domain

### Option C: Hostinger Git Deployment

1. Push this folder to a GitHub/GitLab repo
2. In hPanel, go to **Advanced → Git**
3. Connect your repo and set `public_html` as the deploy path
4. Every push auto-deploys

## Google Sheets Setup (Lead Collection)

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. In **Row 1**, add headers: `Timestamp | Name | Country Code | Mobile | Email | Date of Birth | Prize Won`
3. Go to **Extensions → Apps Script**
4. Delete existing code, paste contents of `google-apps-script.js`
5. Click **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. **Authorize** when prompted, then copy the **Web app URL**
7. Open `script.js` and paste the URL:
   ```js
   const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/YOUR_ID/exec';
   ```

Every visitor's details + their prize will appear in your Google Sheet automatically.

## Local Preview

Just open `index.html` in a browser — no server needed.

Or use any local server:

```bash
# Python
python3 -m http.server 8080

# Node.js
npx serve .
```

## Customization

Edit the `DEFAULT_SEGMENTS` array in `script.js` to change the default prizes:

```js
const DEFAULT_SEGMENTS = [
  { label: '$100',  color: '#7c3aed' },
  { label: '$250',  color: '#059669' },
  // add more...
];
```

## License

MIT — use freely for personal or commercial projects.
