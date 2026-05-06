// Generates minimal valid PNG icons using only Node.js built-ins
import { createCanvas } from 'node:canvas';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0f0f0f';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.15);
  ctx.fill();

  // Vinyl record
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.39, 0, Math.PI * 2);
  ctx.fill();

  // Label
  ctx.fillStyle = '#6d28d9';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.13, 0, Math.PI * 2);
  ctx.fill();

  // Play triangle
  ctx.fillStyle = 'white';
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.07;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.6, cy - r);
  ctx.lineTo(cx - r * 0.6, cy + r);
  ctx.lineTo(cx + r, cy);
  ctx.closePath();
  ctx.fill();

  // Center hole
  ctx.fillStyle = '#0f0f0f';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toBuffer('image/png');
}

try {
  writeFileSync(path.join(publicDir, 'icon-192.png'), drawIcon(192));
  writeFileSync(path.join(publicDir, 'icon-512.png'), drawIcon(512));
  console.log('Icons generated.');
} catch (e) {
  console.log('canvas not available, skipping PNG icons (SVG icon will be used).');
}
