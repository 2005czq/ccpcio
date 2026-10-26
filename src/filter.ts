import type { ProblemInfo } from './types';
import { isAtOrAfterFreeze } from './contest';

export const FILTER_THRESHOLD = 50;

let filterEnabled = true;

export function isFilterEnabled(): boolean {
  return filterEnabled;
}

export function setFilterEnabled(val: boolean): void {
  filterEnabled = val;
  updateFilter();
}

// 获取当前页面表格中的题目列表与通过数
export function getProblemsFromTable(): ProblemInfo[] {
  const ths = Array.from(
    document.querySelectorAll('table.standings thead tr > th, table.standings tr:first-child > th')
  ) as HTMLElement[];

  const problems: ProblemInfo[] = [];
  let problemIdx = 0;

  ths.forEach((th, i) => {
    const text = th.innerText.trim();
    const m = text.match(/^([A-Z])\s*(\d+)$/);
    if (m) {
      problems.push({
        thColIndex: i,
        problemIdx: problemIdx++,
        problem: m[1],
        solves: parseInt(m[2], 10)
      });
    }
  });

  return problems;
}

// 主过滤更新函数
export function updateFilter(): void {
  let style = document.getElementById('ccpcio-problem-filter-style') as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = 'ccpcio-problem-filter-style';
    document.head.appendChild(style);
  }

  // 封榜后所有题默认开启；若用户手动关闭过滤也是全开
  if (!filterEnabled || isAtOrAfterFreeze()) {
    style.textContent = '';
    return;
  }

  const problems = getProblemsFromTable();
  if (problems.length === 0) return;

  const unopened = problems.filter(p => p.solves < FILTER_THRESHOLD);

  // 隐藏通过数 < 50 的题目列
  const cssRules: string[] = [];
  unopened.forEach(p => {
    cssRules.push(`table.standings tr:not(.statistics-0):not(.statistics-1) > :nth-child(${p.thColIndex + 1}) { display: none !important; }`);
    cssRules.push(`table.standings tr.statistics-0 > :nth-child(${3 + p.problemIdx}) { display: none !important; }`);
    cssRules.push(`table.standings tr.statistics-1 > :nth-child(${3 + p.problemIdx}) { display: none !important; }`);
  });

  style.textContent = cssRules.join('\n');
}
