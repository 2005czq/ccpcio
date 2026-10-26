import './style.css';
import { ensureOfficialGroup } from './contest';
import { updateFilter } from './filter';
import { initNavbarUI, syncUIState } from './ui';

function main(): void {
  // 默认切换正式队伍并同步控件和题目过滤。
  ensureOfficialGroup();

  initNavbarUI();

  updateFilter();
  syncUIState();

  // 监听榜单与时间轴变动，每帧合并更新。
  let rafId: number | null = null;
  const observer = new MutationObserver(() => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      ensureOfficialGroup();
      initNavbarUI();
      updateFilter();
      syncUIState();
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false
  });
}

// 启动入口
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
