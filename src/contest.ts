export function getVueApp(): any {
  return (document.querySelector('#app') as any)?.__vue_app__;
}

export function getProgressComp(): any {
  const root = document.querySelector('#app') as any;
  if (!root || !root._vnode) return null;
  let progressComp: any = null;

  function walk(vnode: any) {
    if (!vnode || progressComp) return;
    if (vnode.component) {
      const name = vnode.component.type.name || vnode.component.type.__name;
      if (name === 'Progress') {
        progressComp = vnode.component;
        return;
      }
      walk(vnode.component.subTree);
    }
    if (Array.isArray(vnode.children)) {
      for (const c of vnode.children) {
        if (c && typeof c === 'object') walk(c);
      }
    }
  }

  walk(root._vnode);
  return progressComp;
}

export function getContestMetadata() {
  const comp = getProgressComp();
  const contest = comp?.props?.rank?.contest;
  const totalDuration = contest?.totalDurationTimestamp || 18000;
  const freezeDuration = contest?.freezeDurationTimestamp ?? 3600;
  return {
    totalDuration,
    freezeDuration,
    freezeStart: totalDuration - freezeDuration
  };
}

// 获取当前时间轴已进行秒数
export function getCurrentElapsedSeconds(): number {
  const app = getVueApp();
  const route = app?._context?.config?.globalProperties?.$route;
  const meta = getContestMetadata();

  if (!route || route.query['progress-ratio'] === undefined) {
    return meta.totalDuration;
  }

  const ratio = parseFloat(route.query['progress-ratio'] as string);
  if (isNaN(ratio) || ratio < 0) {
    return meta.totalDuration;
  }

  return Math.floor(meta.totalDuration * (ratio / 10000));
}

// 检查当前是否在封榜之后
export function isAtOrAfterFreeze(): boolean {
  const currentElapsed = getCurrentElapsedSeconds();
  const meta = getContestMetadata();
  return currentElapsed >= meta.freezeStart - 15;
}

// 解析时间字符串为秒数 (HH:MM:SS 或 MM:SS)
export function parseTimeToSeconds(str: string): number | null {
  if (!str) return null;
  const parts = str.trim().split(':').map(p => parseInt(p, 10));
  if (parts.some(isNaN)) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return null;
}

// 设置时间轴
export function setTimeline(elapsedSeconds: number, isFinalBoard = false): boolean {
  const scroll = document.querySelector('.am-progress') as HTMLElement;
  const cursor = document.querySelector('.am-progress-cursor') as HTMLElement;
  if (!scroll || !cursor) return false;

  const meta = getContestMetadata();
  const progressComp = getProgressComp();
  const app = getVueApp();
  const router = app?._context?.config?.globalProperties?.$router;
  const route = app?._context?.config?.globalProperties?.$route;
  const replaceRoute = (query: any): void => {
    if (!router || !route) return;

    // The native progress drag handler writes its own ratio asynchronously.
    // Apply our exact target after that write so it cannot overwrite the jump.
    window.setTimeout(() => {
      router.replace({ path: route.path, query });
    }, 0);
  };

  if (isFinalBoard) {
    cursor.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: cursor.offsetLeft }));
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: scroll.offsetWidth }));
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    if (progressComp?.props?.rankOptions) {
      progressComp.props.rankOptions.disableFilterSubmissionByTimestamp();
    }
    const query = { ...route?.query };
    delete query['progress-ratio'];
    replaceRoute(query);
    return true;
  }

  if (elapsedSeconds >= meta.freezeStart) {
    elapsedSeconds = meta.freezeStart;
  }
  if (elapsedSeconds < 0) elapsedSeconds = 0;

  const targetRatio = elapsedSeconds / meta.totalDuration;
  const targetI = Math.min(10000, Math.max(0, Math.round(targetRatio * 10000)));
  const targetN = Math.round((targetI / 10000) * scroll.offsetWidth - cursor.offsetWidth);

  cursor.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: cursor.offsetLeft }));
  document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: targetN }));
  document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

  if (progressComp?.props?.rankOptions && progressComp?.props?.rank?.contest) {
    progressComp.props.rankOptions.setWidth(targetI, progressComp.props.rank.contest);
  }
  const query = { ...route?.query, 'progress-ratio': targetI };
  replaceRoute(query);
  return true;
}

// 自动切换到正式队伍
export function ensureOfficialGroup(): void {
  const app = getVueApp();
  const route = app?._context?.config?.globalProperties?.$route;
  const router = app?._context?.config?.globalProperties?.$router;

  if (route && route.query.group !== 'official' && router) {
    router.replace({ path: route.path, query: { ...route.query, group: 'official' } });
  }

  const menuItems = Array.from(document.querySelectorAll('.second-level-menu-item')) as HTMLElement[];
  const officialBtn = menuItems.find(item => item.innerText.includes('正式队伍'));
  if (officialBtn && !officialBtn.classList.contains('second-level-menu-item-current')) {
    officialBtn.click();
  }
}
