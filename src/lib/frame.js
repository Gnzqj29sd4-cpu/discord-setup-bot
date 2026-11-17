'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { frame } = require('../config');

// Le cadre est un PNG avec le centre transparent : l'image du membre est collée
// dessous, le cadre par-dessus, puis le pseudo est écrit en bas.
// Si le centre n'est pas transparent, une zone explicite peut être enregistrée
// avec /cadre zone:gauche,haut,largeur,hauteur (en pourcentage).
const dataFile = path.join(__dirname, '..', '..', 'data', 'frame.png');
const zoneFile = path.join(__dirname, '..', '..', 'data', 'frame.json');
const assetFile = path.join(__dirname, '..', '..', 'assets', 'frame.png');

let sharp = null;
try {
  // sharp est une dépendance native : si elle n'est pas installée, le cadrage
  // est simplement désactivé au lieu de faire planter le bot.
  sharp = require('sharp');
} catch (error) {
  console.warn('[cadre] sharp indisponible, cadrage désactivé :', error.message);
}

let cached = null;

async function fetchBuffer(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

/** Zone enregistrée à la main, en pourcentage de la taille du cadre. */
function readZone() {
  try {
    const parsed = JSON.parse(fs.readFileSync(zoneFile, 'utf8'));
    const { left, top, width, height } = parsed ?? {};
    if ([left, top, width, height].every((value) => typeof value === 'number')) {
      return parsed;
    }
  } catch {
    /* pas de zone enregistrée */
  }
  return null;
}

function saveZone(zone) {
  fs.mkdirSync(path.dirname(zoneFile), { recursive: true });
  fs.writeFileSync(zoneFile, JSON.stringify(zone, null, 2), 'utf8');
}

/** Le PNG du cadre : FRAME_URL, data/frame.png, ou assets/frame.png. */
async function loadFrame() {
  if (cached) return cached;

  if (process.env.FRAME_URL) {
    cached = await fetchBuffer(process.env.FRAME_URL);
    return cached;
  }

  for (const file of [dataFile, assetFile]) {
    try {
      cached = fs.readFileSync(file);
      return cached;
    } catch {
      /* fichier absent : on essaie le suivant */
    }
  }

  return null;
}

function saveFrame(buffer) {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, buffer);
  cached = buffer;
}

function clearFrameCache() {
  cached = null;
}

/** Rectangle transparent du cadre (le trou où va l'image), sinon zone manuelle. */
async function findHole(frameBuffer) {
  const { data, info } = await sharp(frameBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let left = info.width;
  let top = info.height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const alpha = data[(y * info.width + x) * 4 + 3];
      if (alpha > 20) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }

  if (right < 0 || bottom < 0) {
    // Aucune transparence : on utilise la zone enregistrée avec /cadre.
    const zone = readZone();
    if (!zone) return null;
    return {
      left: Math.round((zone.left / 100) * info.width),
      top: Math.round((zone.top / 100) * info.height),
      width: Math.round((zone.width / 100) * info.width),
      height: Math.round((zone.height / 100) * info.height),
      frameWidth: info.width,
      frameHeight: info.height,
    };
  }

  return {
    left,
    top,
    width: right - left + 1,
    height: bottom - top + 1,
    frameWidth: info.width,
    frameHeight: info.height,
  };
}

/** Échappe le texte pour un SVG. */
function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildTextSvg(text, hole) {
  const { frameWidth, frameHeight } = hole;
  const fontSize = Math.round(frameHeight * frame.text.sizeRatio);
  const centerX = Math.round(hole.left + hole.width / 2);
  // Juste sous l'image, dans la bande du bas du cadre.
  const centerY = Math.round(
    Math.min(hole.top + hole.height + fontSize * 1.4, frameHeight - frameHeight * 0.02),
  );

  return Buffer.from(
    `<svg width="${frameWidth}" height="${frameHeight}" xmlns="http://www.w3.org/2000/svg">
      <text x="${centerX}" y="${centerY}" text-anchor="middle"
        font-family="DejaVu Sans, Verdana, Arial, sans-serif"
        font-size="${fontSize}" font-weight="bold"
        fill="${frame.text.color}" stroke="#000000" stroke-width="${Math.max(2, Math.round(fontSize / 12))}"
        paint-order="stroke">${escapeXml(text)}</text>
    </svg>`,
  );
}

/**
 * Colle l'image dans le cadre et écrit le pseudo en bas.
 * Renvoie un PNG (Buffer), ou null si le cadrage est impossible.
 */
async function frameImage(imageBuffer, username) {
  if (!sharp || !frame.enabled) return null;

  const frameBuffer = await loadFrame();
  if (!frameBuffer) return null;

  const hole = await findHole(frameBuffer);
  if (!hole || hole.width < 20 || hole.height < 20) return null;

  const media = await sharp(imageBuffer)
    .resize(hole.width, hole.height, { fit: 'cover', position: 'centre' })
    .png()
    .toBuffer();

  const layers = [{ input: media, left: hole.left, top: hole.top }];

  if (frame.showUsername && username) {
    const textSvg = await sharp(buildTextSvg(username, hole)).png().toBuffer();
    layers.push({ input: textSvg, left: 0, top: 0 });
  }

  // Le cadre est posé en dernier : sa transparence laisse voir l'image.
  layers.push({ input: frameBuffer, left: 0, top: 0 });

  return sharp({
    create: {
      width: hole.frameWidth,
      height: hole.frameHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite(layers)
    .png()
    .toBuffer();
}

/** Le cadrage est-il utilisable ? */
async function frameAvailable() {
  if (!sharp || !frame.enabled) return false;
  return Boolean(await loadFrame());
}

module.exports = {
  frameImage,
  frameAvailable,
  loadFrame,
  saveFrame,
  saveZone,
  clearFrameCache,
  findHole,
};
