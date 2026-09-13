const outputs = {
  '1k': { size: '1024 × 1024 · Base generation' },
  '2k': { size: '2048 × 2048 · 4× pixels' },
  '3k': { size: '3072 × 3072 · 9× pixels' },
  '4k': { size: '4096 × 4096 · 16× pixels' },
};

const cases = {
  '01': { full: 'there is a woman with a scarf on her head looking at the camera', parts: { body_structure: 'a woman' } },
  '02': { full: 'a close up of a woman with a very long hair and a pretty make up', parts: { body_structure: 'a woman', hair: 'long hair' } },
  '03': { full: 'a close up of a man in a red shirt and black pants', parts: { body_structure: 'a man', tops: 'a close up of a man in a red shirt', bottoms: 'a close up of a man in a red shirt and black pants' } },
  '04': { full: 'a woman wearing a blue and white nike sweatshirt with a heart', parts: { body_structure: 'a woman', tops: 'a woman wearing a blue and white nike sweat shirt' } },
};

const partLabels = { body_structure: 'Body structure', hair: 'Hair', tops: 'Tops', bottoms: 'Bottoms' };

const resolutionButtons = [...document.querySelectorAll('[data-resolution]')];
const caseButtons = [...document.querySelectorAll('[data-case]')];
const outputImage = document.querySelector('#output-image');
const baselineImage = document.querySelector('#baseline-image');
const status = document.querySelector('#resolution-status');
const afterLabel = document.querySelector('#after-label');
const beforeLabel = document.querySelector('#before-label');
const rangeBeforeLabel = document.querySelector('#range-before-label');
const rangeOutputLabel = document.querySelector('#range-output-label');
const compareRange = document.querySelector('#compare-range');
const viewerNote = document.querySelector('#viewer-note');
const loadingOverlay = document.querySelector('#loading-overlay');
const compareSlider = document.querySelector('#compare-slider');
const beforeLayer = document.querySelector('#before-layer');
const divider = document.querySelector('#divider');
const zoomRange = document.querySelector('#zoom-range');
const zoomValue = document.querySelector('#zoom-value');
const zoomStage = document.querySelector('#zoom-stage');
const comparison = document.querySelector('#comparison');
const templateButton = document.querySelector('#template-button');
const templateDialog = document.querySelector('#template-dialog');
const templateThumbnail = document.querySelector('#template-thumbnail');
const templateDialogImage = document.querySelector('#template-dialog-image');
const fullPrompt = document.querySelector('#full-prompt');
const promptParts = document.querySelector('#prompt-parts');
const caseTitle = document.querySelector('#case-title');
const closeDialog = document.querySelector('.dialog-close');

let activeResolution = '4k';
let activeCase = '01';
let zoom = 1;
const cache = new Map();

function preload(path) {
  if (cache.has(path)) return cache.get(path);
  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = reject;
    image.src = path;
  });
  cache.set(path, promise);
  return promise;
}

async function selectResolution(key) {
  const base = `case-${activeCase}/${key}`;
  const selection = { ...outputs[key], path: `${base}.png`, baseline: key === '1k' ? null : `${base}_cv2.png` };
  loadingOverlay.classList.add('active');
  try {
    await Promise.all([preload(selection.path), selection.baseline ? preload(selection.baseline) : Promise.resolve()]);
    activeResolution = key;
    outputImage.src = selection.path;
    outputImage.alt = `HRHuman output at ${selection.size}`;
    status.textContent = selection.size;
    const isBase = key === '1k';
    comparison.classList.toggle('single-view', isBase);
    compareRange.hidden = isBase;
    if (!isBase) baselineImage.src = selection.baseline;
    beforeLabel.textContent = 'OpenCV interpolation';
    rangeBeforeLabel.textContent = 'OpenCV interpolation';
    afterLabel.textContent = isBase ? 'Original 1K generation' : `HRHuman · ${key.toUpperCase()}`;
    rangeOutputLabel.textContent = afterLabel.textContent;
    viewerNote.textContent = isBase
      ? 'The original 1K SDXL generation is shown directly. After zooming, double-click to center a region.'
      : 'Drag the divider with the left mouse button. After zooming, double-click to center a region for closer inspection.';
    resolutionButtons.forEach((button) => {
      const active = button.dataset.resolution === key;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  } finally {
    loadingOverlay.classList.remove('active');
  }
}

async function selectCase(key) {
  activeCase = key;
  const selected = cases[key];
  fullPrompt.textContent = `“${selected.full}”`;
  promptParts.replaceChildren(...Object.entries(selected.parts).map(([name, value]) => {
    const item = document.createElement('span');
    const label = document.createElement('b');
    label.textContent = partLabels[name] || name;
    item.append(label, ` ${value}`);
    return item;
  }));
  caseTitle.textContent = `Case ${key}`;
  const segmentation = `case-${key}/seg.png`;
  templateThumbnail.src = segmentation;
  templateThumbnail.alt = `Sapiens human-part segmentation map for Case ${key}`;
  templateDialogImage.src = segmentation;
  templateDialogImage.alt = `Enlarged Sapiens human-part segmentation map for Case ${key}`;
  caseButtons.forEach((button) => {
    const active = button.dataset.case === key;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  await selectResolution(activeResolution);
}

function updateDivider() {
  const value = Number(compareSlider.value);
  beforeLayer.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
  divider.style.left = `${value}%`;
  divider.setAttribute('aria-valuenow', String(Math.round(value)));
}

function moveDivider(event) {
  const box = comparison.getBoundingClientRect();
  const value = Math.max(0, Math.min(100, ((event.clientX - box.left) / box.width) * 100));
  compareSlider.value = String(value);
  updateDivider();
}

function startDividerDrag(event) {
  if (event.button !== undefined && event.button !== 0) return;
  event.preventDefault();
  divider.setPointerCapture(event.pointerId);
  moveDivider(event);
}

function updateZoom() {
  zoom = Number(zoomRange.value);
  zoomValue.textContent = `${zoom.toFixed(2).replace(/\.00$/, '.0')}×`;
  const transform = `scale(${zoom})`;
  outputImage.style.transform = transform;
  baselineImage.style.transform = transform;
}

function updateZoomOrigin(event) {
  if (zoom === 1) return;
  const box = comparison.getBoundingClientRect();
  const x = ((event.clientX - box.left) / box.width) * 100;
  const y = ((event.clientY - box.top) / box.height) * 100;
  const origin = `${x}% ${y}%`;
  outputImage.style.transformOrigin = origin;
  baselineImage.style.transformOrigin = origin;
}

resolutionButtons.forEach((button) => button.addEventListener('click', () => selectResolution(button.dataset.resolution)));
caseButtons.forEach((button) => button.addEventListener('click', () => selectCase(button.dataset.case)));
compareSlider.addEventListener('input', updateDivider);
divider.addEventListener('pointerdown', startDividerDrag);
divider.addEventListener('pointermove', (event) => {
  if (divider.hasPointerCapture(event.pointerId)) moveDivider(event);
});
divider.addEventListener('keydown', (event) => {
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  compareSlider.value = String(Number(compareSlider.value) + (event.key === 'ArrowRight' ? 1 : -1));
  updateDivider();
});
zoomRange.addEventListener('input', updateZoom);
comparison.addEventListener('dblclick', updateZoomOrigin);
templateButton.addEventListener('click', () => { templateDialog.showModal(); templateButton.setAttribute('aria-expanded', 'true'); });
closeDialog.addEventListener('click', () => templateDialog.close());
templateDialog.addEventListener('close', () => templateButton.setAttribute('aria-expanded', 'false'));
templateDialog.addEventListener('click', (event) => { if (event.target === templateDialog) templateDialog.close(); });

preload(`case-${activeCase}/${activeResolution}.png`);
updateDivider();
updateZoom();
