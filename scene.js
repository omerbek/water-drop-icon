'use strict';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const mint = '#9ef4dc';
const amber = '#ffcb7d';
const ink = '#152129';
const duration = 8;

function rect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function line(points, color = mint, width = 3) {
  ctx.beginPath();
  points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => clamp(value) ** 2 * (3 - 2 * clamp(value));

function render(t) {
  ctx.beginPath();
  ctx.moveTo(360, 90);
  ctx.bezierCurveTo(325, 149, 283, 187, 283, 232);
  ctx.bezierCurveTo(283, 334, 437, 334, 437, 232);
  ctx.bezierCurveTo(437, 187, 395, 149, 360, 90);
  ctx.lineWidth = 4;
  ctx.strokeStyle = mint;
  ctx.stroke();
  const p = smooth((t - 1) / 2);
  line([[322, 230], [350, 258], [350 + 51 * p, 258 - 63 * p]], amber, 7);
}

const seek = document.querySelector('#seek');
const play = document.querySelector('#play');
const time = document.querySelector('#time');
let position = 0;
let playing = false;
let previous = null;
let animationId = null;

function draw() {
  rect(0, 0, canvas.width, canvas.height, ink);
  render(position);
  seek.value = position;
  time.value = `${position.toFixed(2)} sn`;
}

function frame(timestamp) {
  if (!playing) return;
  if (previous !== null) position = (position + (timestamp - previous) / 1000) % duration;
  previous = timestamp;
  draw();
  animationId = requestAnimationFrame(frame);
}

play.addEventListener('click', () => {
  playing = !playing;
  play.textContent = playing ? 'Duraklat' : 'Oynat';
  if (playing) {
    previous = null;
    animationId = requestAnimationFrame(frame);
  } else {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
});

seek.addEventListener('input', () => {
  position = Number(seek.value);
  draw();
});

draw();
