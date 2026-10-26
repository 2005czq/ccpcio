import { createSvg, ICONS } from './icons';
import type { TimeMode } from './types';
import {
  parseTimeToSeconds,
  getContestMetadata,
  setTimeline,
  isAtOrAfterFreeze
} from './contest';
import {
  isFilterEnabled,
  setFilterEnabled
} from './filter';

let currentTimeMode: TimeMode = 'countdown';

function setButtonIcon(button: HTMLElement, icon: string): void {
  button.replaceChildren(createSvg(icon));
}

function createIconButton(id: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.id = id;
  button.setAttribute('icon-btn', '');
  button.onclick = onClick;
  return button;
}

export function setTimeMode(mode: TimeMode): void {
  currentTimeMode = mode;
  updateModeButtonUI();
}

function updateModeButtonUI(): void {
  const modeBtn = document.getElementById('ccpcio-mode-btn');
  const input = document.getElementById('ccpcio-time-input') as HTMLInputElement | null;
  if (!modeBtn || !input) return;

  const countdown = currentTimeMode === 'countdown';
  setButtonIcon(modeBtn, countdown ? ICONS.minus : ICONS.plus);
  modeBtn.title = countdown ? '倒计时' : '正计时';
  input.placeholder = countdown ? '03:55:26' : '01:04:34';
}

function updateFilterButtonUI(): void {
  const filterBtn = document.getElementById('ccpcio-filter-btn');
  if (!filterBtn) return;

  const enabled = isFilterEnabled();
  const frozen = isAtOrAfterFreeze();

  const showFilter = enabled || frozen;
  setButtonIcon(filterBtn, showFilter ? ICONS.filter : ICONS.filterX);
  filterBtn.title = frozen ? '封榜全开' : showFilter ? '过题>=50' : '全部题目';
}

export function handleJumpAction(): void {
  const input = document.getElementById('ccpcio-time-input') as HTMLInputElement | null;
  if (!input) return;

  const trimmed = input.value.trim();
  if (!trimmed) return;

  const seconds = parseTimeToSeconds(trimmed);
  if (seconds === null) {
    alert('格式错误 (如 03:55:26 或 00:00:00)');
    return;
  }

  const meta = getContestMetadata();
  // Normalize countdown input to elapsed time before applying timeline limits.
  const elapsed = currentTimeMode === 'countdown'
    ? meta.totalDuration - seconds
    : seconds;

  if (elapsed >= meta.totalDuration) {
    setTimeline(0, true);
  } else if (elapsed >= meta.freezeStart) {
    setTimeline(meta.freezeStart, false);
  } else {
    setTimeline(elapsed, false);
  }

  updateFilterButtonUI();
}

export function initNavbarUI(): void {
  const right = document.querySelector('.nav .right') as HTMLElement | null;
  const nav = right?.closest('.nav') as HTMLElement | null;
  if (!right || !nav || document.getElementById('ccpcio-controls')) return;

  nav.classList.add('ccpcio-nav');
  nav.closest('.header')?.classList.add('ccpcio-header');
  nav.closest('#app')?.classList.add('ccpcio-app');

  const controls = document.createElement('div');
  controls.id = 'ccpcio-controls';
  controls.setAttribute('aria-label', 'CCPCIO 工具');

  // 1. 正/倒计时开关 SVG (- / +) 放在输入框左侧
  const modeBtn = createIconButton('ccpcio-mode-btn', () => {
    setTimeMode(currentTimeMode === 'countdown' ? 'elapsed' : 'countdown');
  });

  // 2. 直角居中输入框 (不随焦点改变边框颜色，保持与图标一致的外边框)
  const input = document.createElement('input');
  input.id = 'ccpcio-time-input';
  input.type = 'text';
  input.onkeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleJumpAction();
  };

  // 3. 跳转按钮 SVG (放在输入框右侧)
  const jumpBtn = createIconButton('ccpcio-jump-btn', handleJumpAction);
  jumpBtn.title = '跳转';
  setButtonIcon(jumpBtn, ICONS.play);

  // 4. >=50题开关 SVG (放在跳转按钮右侧)
  const filterBtn = createIconButton('ccpcio-filter-btn', () => {
    setFilterEnabled(!isFilterEnabled());
    updateFilterButtonUI();
  });

  // 将自定义控件作为导航栏第二行，避免与官网工具混在同一行。
  [modeBtn, input, jumpBtn, filterBtn].forEach((control) => {
    controls.appendChild(control);
  });
  nav.appendChild(controls);

  updateModeButtonUI();
  updateFilterButtonUI();
}

export function syncUIState(): void {
  updateFilterButtonUI();
}
