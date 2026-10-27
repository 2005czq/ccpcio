import './style.css';
import { ensureOfficialGroup, isCompetitionPage } from './contest';
import { updateFilter } from './filter';
import { initNavbarUI, syncUIState } from './ui';

function main(): void {
  syncPageUI();

  // 监听榜单与时间轴变动，每帧合并更新。
  let rafId: number | null = null;
  const observer = new MutationObserver(() => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      syncPageUI();
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false
  });
}

function syncPageUI(): void {
  initNavbarUI();
  if (!isCompetitionPage()) return;

  ensureOfficialGroup();
  updateFilter();
  syncUIState();
}

// 启动入口
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
