const cases = {
  'case-01': {
    id: '01628_04393',
    source: 'case-01/01628_04393_source.png',
    reference: 'case-01/01628_04393_reference.png',
  },
  'case-02': {
    id: '03976_01335',
    source: 'case-02/03976_01335_source.png',
    reference: 'case-02/03976_01335_ref.png',
  },
  'case-03': {
    id: '00214_25257',
    source: 'case-03/00214_25257_source.png',
    reference: 'case-03/00214_25257_reference.png',
  },
};

const filenameOrder = ['eyebrows', 'eyes', 'mouth', 'nose'];
const imageCache = new Map();
const checkboxes = [...document.querySelectorAll('.component-option input')];
const caseButtons = [...document.querySelectorAll('.case-option')];
const sourcePortrait = document.querySelector('#source-portrait');
const referencePortrait = document.querySelector('#reference-portrait');
const comparisonSource = document.querySelector('#comparison-source');
const resultImage = document.querySelector('#result-image');
const summary = document.querySelector('#selection-summary');
const overlay = document.querySelector('#processing-overlay');
const status = document.querySelector('#result-status');
const slider = document.querySelector('#comparison-slider');
const beforeLayer = document.querySelector('#before-layer');
const divider = document.querySelector('#divider');

let activeCase = 'case-01';
let renderToken = 0;

function preloadImage(path) {
  if (imageCache.has(path)) return imageCache.get(path);
  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(path);
    image.onerror = reject;
    image.src = path;
  });
  imageCache.set(path, promise);
  return promise;
}

function selectedComponents() {
  return checkboxes.filter((input) => input.checked).map((input) => input.value);
}

function resultPath(caseKey, selected) {
  const current = cases[caseKey];
  if (selected.length === 0) return current.source;
  const suffix = filenameOrder.filter((component) => selected.includes(component)).join('_');
  return `${caseKey}/${current.id}_${suffix}.png`;
}

function describeSelection(selected) {
  if (selected.length === 0) return 'No components selected';
  return `${selected.length} component${selected.length === 1 ? '' : 's'} selected: ${selected.join(', ')}`;
}

function updateCaseControls() {
  caseButtons.forEach((button) => {
    const isActive = button.dataset.case === activeCase;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

async function renderSelection() {
  const token = ++renderToken;
  const selected = selectedComponents();
  const current = cases[activeCase];
  const path = resultPath(activeCase, selected);

  summary.textContent = describeSelection(selected);
  overlay.classList.add('active');
  status.textContent = 'Loading';

  try {
    await Promise.all([
      preloadImage(current.source),
      preloadImage(current.reference),
      preloadImage(path),
    ]);
    if (token !== renderToken) return;

    const caseNumber = activeCase.slice(-2);
    sourcePortrait.src = current.source;
    sourcePortrait.alt = `Source portrait for Case ${caseNumber}`;
    referencePortrait.src = current.reference;
    referencePortrait.alt = `Reference portrait for Case ${caseNumber}`;
    comparisonSource.src = current.source;
    comparisonSource.alt = `Source portrait for Case ${caseNumber}`;
    resultImage.src = path;
    resultImage.alt = selected.length
      ? `FaceComposer result for Case ${caseNumber} with ${selected.join(', ')} transferred`
      : `Unchanged source portrait for Case ${caseNumber}`;
    status.textContent = selected.length ? 'Updated' : 'Source only';
  } catch (error) {
    if (token !== renderToken) return;
    status.textContent = 'Image unavailable';
  } finally {
    if (token === renderToken) overlay.classList.remove('active');
  }
}

function updateSlider() {
  const value = Number(slider.value);
  beforeLayer.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
  divider.style.left = `${value}%`;
}

checkboxes.forEach((checkbox) => checkbox.addEventListener('change', renderSelection));
caseButtons.forEach((button) => button.addEventListener('click', () => {
  activeCase = button.dataset.case;
  updateCaseControls();
  renderSelection();
}));
slider.addEventListener('input', updateSlider);

updateCaseControls();
updateSlider();
renderSelection();
