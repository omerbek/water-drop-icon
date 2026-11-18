'use strict';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const mint = '#9ef4dc';
const amber = '#ffcb7d';
const ink = '#152129';
const duration = 8;
const controls = [...document.querySelectorAll('#settings input')];
const settings = Object.fromEntries(controls.map(input => [
  input.id, input.type === 'number' ? Number(input.value) : input.value
]));
controls.forEach(input => input.addEventListener('input', () => {
  if (input.type === 'number' && (input.value === '' || !input.validity.valid)) return;
  settings[input.id] = input.type === 'number' ? input.valueAsNumber : input.value;
  draw();
}));

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
  ctx.lineWidth = settings.stroke;
  ctx.strokeStyle = mint;
  ctx.stroke();
  const p = smooth((t - settings.delay) / 2);
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
  time.value = `${position.toFixed(2)} ${language === 'en' ? 's' : 'sn'}`;
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
  updatePlaybackLabel();
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

document.querySelector('#save').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'water-drop-icon.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

const copy = {"title": ["Vektör durum simgesi", "Water Drop Icon"], "description": ["Bir damla ve onay işaretini çözünürlükten bağımsız çiz.", "Adjust stroke width and the timing of an animated check mark."], "preview": ["Seçili hareket deneyinin önizlemesi", "Animation preview"], "timeline": ["Zaman çizelgesi", "Timeline"], "settings": ["Sahne ayarları", "Scene settings"], "save": ["PNG indir", "Download PNG"], "stroke": ["Kontur kalınlığı", "Stroke width"], "delay": ["Onay başlangıcı (s)", "Check mark start (s)"]};
const dictionary = {"Debi": "Flow", "ÇIKIŞ DEBİSİ": "OUTLET FLOW", "Normal çalışma": "Operating normally", "Ölçüm birimi görünür": "Unit is visible", "Durum etiketi okunur": "Status label is legible", "Geçiş sekiz saniyeye sığar": "Transition fits in eight seconds", "SU AKIŞI": "WATER FLOW", "Yalova · Su istasyonu": "Yalova · Water station", "İstasyon": "Station", "Komut": "Prompt", "Tohum": "Seed", "Örnekle": "Sample", "Çıktı": "Output", "Suyu sarı bir uyarı çizgisiyle anlat.": "Show the water as a yellow alert line.", "Akışı camgöbeği bir dalgaya dönüştür.": "Turn the flow into a cyan wave.", "Veriyi noktalardan oluşan bir haritaya işle.": "Map the data as a field of dots.", "Akış": "Flow", "Ölçüm": "Reading", "Mavi saat": "Blue hour", "Bakır günbatımı": "Copper sunset", "Yeşil şafak": "Green dawn", "Kare": "Frame", "Oynat": "Play", "Duraklat": "Pause"};
const fieldDefaults = {};
let language = 'tr';
function translate(value) {
  return language === 'en' ? (Object.hasOwn(dictionary, value) ? dictionary[value] : value) : value;
}
function updatePlaybackLabel() {
  play.textContent = translate(playing ? 'Duraklat' : 'Oynat');
}
function setLanguage(next) {
  const previousLanguage = language;
  language = next;
  document.documentElement.lang = next;
  const index = next === 'en' ? 1 : 0;
  document.title = copy.title[index];
  for (const item of document.querySelectorAll('[data-i18n]')) item.textContent = copy[item.dataset.i18n][index];
  for (const item of document.querySelectorAll('[data-i18n-label]')) item.setAttribute('aria-label', copy[item.dataset.i18nLabel][index]);
  for (const code of ['tr', 'en']) document.querySelector('#lang-' + code).setAttribute('aria-pressed', String(code === next));
  if (previousLanguage !== next) {
    for (const field of document.querySelectorAll('#settings input[type="text"]')) {
      const original = field.defaultValue;
      const english = Object.hasOwn(fieldDefaults, original) ? fieldDefaults[original] : original;
      if (field.value === (previousLanguage === 'en' ? english : original)) {
        field.value = next === 'en' ? english : original;
        field.dispatchEvent(new Event('input'));
      }
    }
  }
  updatePlaybackLabel();
  draw();
}
for (const code of ['tr', 'en']) document.querySelector('#lang-' + code).addEventListener('click', () => setLanguage(code));

setLanguage('tr');
