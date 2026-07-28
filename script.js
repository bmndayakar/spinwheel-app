/* ── Default Segments ─────────────────────────── */
const DEFAULT_SEGMENTS = [
  { label: '10% Off',              color: '#2563eb' },
  { label: 'Better Luck Next Time', color: '#d97706' },
  { label: '20% Off',              color: '#059669' },
  { label: 'Try Again',            color: '#dc2626' },
  { label: '5% Off',               color: '#7c3aed' },
  { label: '15% Off',              color: '#0891b2' },
];

const ADMIN_KEY = 'Hunger@123';

let segments = JSON.parse(JSON.stringify(DEFAULT_SEGMENTS));
let spinning = false;
let currentAngle = 0;
let unlocked = false;

/* ── DOM refs ─────────────────────────────────── */
const canvas     = document.getElementById('wheelCanvas');
const ctx        = canvas.getContext('2d');
const spinBtn    = document.getElementById('spinBtn');
const segList      = document.getElementById('segmentList');
const addBtn       = document.getElementById('addSegmentBtn');
const applyBtn     = document.getElementById('applyBtn');
const modal        = document.getElementById('resultModal');
const resultText   = document.getElementById('resultText');
const closeModal   = document.getElementById('closeModal');
const confetti     = document.getElementById('confettiBurst');
const editToggle   = document.getElementById('editToggleBtn');
const editPanel    = document.getElementById('editPanel');
const lockBtn      = document.getElementById('lockBtn');
const keyModal     = document.getElementById('keyModal');
const keyInput     = document.getElementById('keyInput');
const keyError     = document.getElementById('keyError');
const keyCancelBtn = document.getElementById('keyCancelBtn');
const keySubmitBtn = document.getElementById('keySubmitBtn');

/* ── High-DPI canvas ──────────────────────────── */
function setupCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width  = rect.width  * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
}

/* ── Text Wrap Helper ─────────────────────────── */
function wrapText(context, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];
  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + ' ' + words[i];
    if (context.measureText(testLine).width > maxWidth) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);
  return lines;
}

/* ── Draw Wheel ───────────────────────────────── */
function drawWheel(angle) {
  const size = canvas.getBoundingClientRect().width;
  const cx = size / 2;
  const cy = size / 2;
  const radius = cx - 10;
  const arc = (2 * Math.PI) / segments.length;

  ctx.clearRect(0, 0, size, size);

  segments.forEach((seg, i) => {
    const startAngle = angle + i * arc;
    const endAngle   = startAngle + arc;

    /* segment fill */
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();

    /* subtle border */
    ctx.strokeStyle = 'rgba(255,255,255,.12)';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* label */
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(startAngle + arc / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0,0,0,.5)';
    ctx.shadowBlur = 4;
    const fontSize = Math.min(16, 160 / segments.length);
    const lineHeight = fontSize * 1.25;
    ctx.font = `bold ${fontSize}px Poppins, sans-serif`;
    const maxTextWidth = radius - 60;
    const lines = wrapText(ctx, seg.label, maxTextWidth);
    const totalHeight = lines.length * lineHeight;
    const startY = -(totalHeight / 2) + lineHeight / 2;
    lines.forEach((line, li) => {
      ctx.fillText(line, radius - 18, startY + li * lineHeight + 4);
    });
    ctx.restore();
  });

  /* outer ring */
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = 'rgba(255,255,255,.18)';
  ctx.lineWidth = 4;
  ctx.stroke();

  /* inner circle (behind the button) */
  ctx.beginPath();
  ctx.arc(cx, cy, 38, 0, 2 * Math.PI);
  ctx.fillStyle = '#1a1a2e';
  ctx.fill();
  ctx.strokeStyle = '#ffd200';
  ctx.lineWidth = 3;
  ctx.stroke();
}

/* ── Spin Logic ───────────────────────────────── */
function spin() {
  if (spinning || segments.length < 2) return;
  spinning = true;
  spinBtn.disabled = true;

  const extraSpins = 5 + Math.random() * 5;                 // 5–10 full rotations
  const targetAngle = currentAngle + extraSpins * 2 * Math.PI;
  const duration = 4000 + Math.random() * 1500;              // 4–5.5s
  const startTime = performance.now();
  const startAngle = currentAngle;

  function animate(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);

    /* ease-out quart */
    const ease = 1 - Math.pow(1 - t, 4);
    currentAngle = startAngle + (targetAngle - startAngle) * ease;

    drawWheel(currentAngle);

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      spinBtn.disabled = false;
      showResult();
    }
  }

  requestAnimationFrame(animate);
}

function showResult() {
  const arc = (2 * Math.PI) / segments.length;
  /* pointer is at the top of the canvas (angle = –π/2).
     Find how far that is from the wheel's rotation origin. */
  let relativeAngle = (-Math.PI / 2 - currentAngle) % (2 * Math.PI);
  if (relativeAngle < 0) relativeAngle += 2 * Math.PI;
  const idx = Math.floor(relativeAngle / arc) % segments.length;

  const label = segments[idx].label;
  const heading = document.getElementById('resultHeading');
  const msg     = document.getElementById('resultMsg');
  const loseKeywords = ['better luck', 'try again'];
  const isLoss = loseKeywords.some(k => label.toLowerCase().includes(k));

  resultText.textContent = label;
  updatePrizeInSheet(label);
  const closeBtn = document.getElementById('closeModal');
  if (isLoss) {
    heading.textContent = '😔 Oops!';
    msg.textContent = '';
    confetti.innerHTML = '';
    closeBtn.textContent = 'Try Again!';
  } else {
    heading.textContent = '🎉 Congratulations!';
    msg.textContent = 'You won: ';
    closeBtn.textContent = 'Awesome!';
    burstConfetti();
  }
  modal.hidden = false;
}

/* ── Confetti ─────────────────────────────────── */
function burstConfetti() {
  confetti.innerHTML = '';
  const colors = ['#ffd200', '#7c3aed', '#ef4444', '#2563eb', '#059669', '#db2777'];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.top  = `${Math.random() * 40}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * .4}s`;
    piece.style.width  = `${6 + Math.random() * 6}px`;
    piece.style.height = `${6 + Math.random() * 6}px`;
    confetti.appendChild(piece);
  }
}

/* ── Segment Editor ───────────────────────────── */
function renderSegmentList() {
  segList.innerHTML = '';
  segments.forEach((seg, i) => {
    const row = document.createElement('div');
    row.className = 'segment-row';
    row.innerHTML = `
      <input type="color" value="${seg.color}" data-idx="${i}" class="seg-color" />
      <input type="text"  value="${seg.label}" data-idx="${i}" class="seg-label" placeholder="Label" />
      <button class="remove-btn" data-idx="${i}" title="Remove">&times;</button>
    `;
    segList.appendChild(row);
  });
}

function applySegments() {
  document.querySelectorAll('.seg-label').forEach(input => {
    segments[input.dataset.idx].label = input.value || 'Prize';
  });
  document.querySelectorAll('.seg-color').forEach(input => {
    segments[input.dataset.idx].color = input.value;
  });
  drawWheel(currentAngle);
}

segList.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-btn')) {
    const idx = parseInt(e.target.dataset.idx, 10);
    if (segments.length <= 2) return;           // minimum 2 segments
    applySegments();
    segments.splice(idx, 1);
    renderSegmentList();
    drawWheel(currentAngle);
  }
});

addBtn.addEventListener('click', () => {
  applySegments();
  const hue = Math.floor(Math.random() * 360);
  segments.push({ label: 'New Prize', color: `hsl(${hue}, 65%, 50%)` });
  renderSegmentList();
  drawWheel(currentAngle);
  segList.scrollTop = segList.scrollHeight;
});

applyBtn.addEventListener('click', () => {
  applySegments();
});

/* ── Admin Key Gate ────────────────────────────── */
editToggle.addEventListener('click', () => {
  if (unlocked) {
    editPanel.hidden = !editPanel.hidden;
    return;
  }
  keyInput.value = '';
  keyError.hidden = true;
  keyModal.hidden = false;
  setTimeout(() => keyInput.focus(), 100);
});

keySubmitBtn.addEventListener('click', tryUnlock);
keyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryUnlock(); });
keyCancelBtn.addEventListener('click', () => { keyModal.hidden = true; });
keyModal.addEventListener('click', (e) => { if (e.target === keyModal) keyModal.hidden = true; });

function tryUnlock() {
  if (keyInput.value === ADMIN_KEY) {
    unlocked = true;
    keyModal.hidden = true;
    editPanel.hidden = false;
    editToggle.textContent = '🔓 Edit Segments';
    renderSegmentList();
  } else {
    keyError.hidden = false;
    keyInput.value = '';
    keyInput.focus();
  }
}

lockBtn.addEventListener('click', () => {
  applySegments();
  unlocked = false;
  editPanel.hidden = true;
  editToggle.textContent = '🔒 Edit Segments';
});

/* ── Lead Capture ─────────────────────────────── */
/*
 * GOOGLE SHEETS SETUP:
 * 1. Create a Google Sheet
 * 2. Go to Extensions → Apps Script
 * 3. Paste the code from google-apps-script.js (provided)
 * 4. Deploy → New deployment → Web app → Anyone can access
 * 5. Copy the URL and paste it below
 */
const GOOGLE_SHEET_URL = ''; // ← paste your Apps Script web app URL here

const leadOverlay  = document.getElementById('leadOverlay');
const mainApp      = document.getElementById('mainApp');
const leadForm     = document.getElementById('leadForm');
const leadName     = document.getElementById('leadName');
const leadMobile   = document.getElementById('leadMobile');
const leadCountry  = document.getElementById('leadCountryCode');
const leadEmail    = document.getElementById('leadEmail');
const leadDob      = document.getElementById('leadDob');
const formError    = document.getElementById('formError');
const leadSubmit   = document.getElementById('leadSubmitBtn');

function validateLeadForm() {
  formError.hidden = true;
  leadName.classList.remove('input-error');
  leadMobile.classList.remove('input-error');
  leadEmail.classList.remove('input-error');

  const name   = leadName.value.trim();
  const mobile = leadMobile.value.trim();
  const email  = leadEmail.value.trim();

  if (!name) {
    leadName.classList.add('input-error');
    showFormError('Please enter your name.');
    leadName.focus();
    return null;
  }

  if (!mobile || !/^[0-9]{7,15}$/.test(mobile)) {
    leadMobile.classList.add('input-error');
    showFormError('Please enter a valid mobile number (7–15 digits).');
    leadMobile.focus();
    return null;
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    leadEmail.classList.add('input-error');
    showFormError('Please enter a valid email address.');
    leadEmail.focus();
    return null;
  }

  return {
    name,
    country_code: leadCountry.value,
    mobile: leadCountry.value + mobile,
    email: email || '',
    dob: leadDob.value || '',
    timestamp: new Date().toISOString(),
  };
}

function showFormError(msg) {
  formError.textContent = msg;
  formError.hidden = false;
}

let lastLeadData = null;

function updatePrizeInSheet(prize) {
  if (!GOOGLE_SHEET_URL || !lastLeadData) return;
  lastLeadData.prize = prize;
  fetch(GOOGLE_SHEET_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lastLeadData),
  }).catch(() => {});
}

function submitToGoogleSheets(data) {
  if (!GOOGLE_SHEET_URL) {
    console.warn('Google Sheet URL not configured — skipping submission.');
    return Promise.resolve();
  }
  return fetch(GOOGLE_SHEET_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

leadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = validateLeadForm();
  if (!data) return;

  leadSubmit.disabled = true;
  leadSubmit.textContent = 'Submitting…';

  try {
    lastLeadData = data;
    await submitToGoogleSheets(data);
    leadOverlay.hidden = true;
    mainApp.style.display = 'flex';
    setupCanvas();
    drawWheel(currentAngle);
  } catch (err) {
    showFormError('Something went wrong. Please try again.');
    console.error('Submission error:', err);
  } finally {
    leadSubmit.disabled = false;
    leadSubmit.textContent = 'Let Me Spin! 🎰';
  }
});

/* ── Events ───────────────────────────────────── */
spinBtn.addEventListener('click', spin);
closeModal.addEventListener('click', () => { modal.hidden = true; });
modal.addEventListener('click', (e) => { if (e.target === modal) modal.hidden = true; });

/* ── Init ─────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  setupCanvas();
  drawWheel(currentAngle);
});

window.addEventListener('resize', () => {
  setupCanvas();
  drawWheel(currentAngle);
});
