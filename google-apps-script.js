/*
 * ══════════════════════════════════════════════════════════════
 *  GOOGLE APPS SCRIPT — Spin & Win Lead Capture
 * ══════════════════════════════════════════════════════════════
 *
 *  SETUP INSTRUCTIONS:
 *
 *  1. Go to https://sheets.google.com and create a new spreadsheet
 *     - Name it "Spin & Win Leads" (or anything you like)
 *     - In row 1, add these headers:
 *       A1: Timestamp | B1: Name | C1: Country Code | D1: Mobile | E1: Email | F1: Date of Birth | G1: Prize Won
 *
 *  2. Go to Extensions → Apps Script
 *     - Delete any existing code in Code.gs
 *     - Paste ALL the code below into Code.gs
 *     - Click Save (💾)
 *
 *  3. Deploy:
 *     - Click "Deploy" → "New deployment"
 *     - Click the gear icon ⚙ → select "Web app"
 *     - Set "Execute as" → "Me"
 *     - Set "Who has access" → "Anyone"
 *     - Click "Deploy"
 *     - Click "Authorize access" and allow permissions
 *     - Copy the Web app URL
 *
 *  4. Paste the URL in script.js:
 *     const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/YOUR_ID/exec';
 *
 *  DONE! Every form submission will now add a row to your Google Sheet.
 *
 * ══════════════════════════════════════════════════════════════
 */

// Handle POST requests from the spin wheel app
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || '',
      data.country_code || '',
      data.mobile || '',
      data.email || '',
      data.dob || '',
      data.prize || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (for testing)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Spin & Win backend is running.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
