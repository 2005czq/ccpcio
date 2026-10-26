export function createSvg(innerHtml: string): SVGElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${innerHtml}</svg>`;
  return wrapper.firstElementChild as SVGElement;
}

export const ICONS = {
  // 正计时 (+)
  plus: `<path d="M5 12h14"></path><path d="M12 5v14"></path>`,
  // 倒计时 (-)
  minus: `<path d="M5 12h14"></path>`,
  // 跳转 (Play)
  play: `<polygon points="6 3 20 12 6 21 6 3"></polygon>`,
  // 过滤开启 (Lucide Filter)
  filter: `<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>`,
  // 过滤关闭 (Lucide FilterX)
  filterX: `<path d="M13.013 3H2l8 9.46V19l4 2v-8.54l.9-1.06"></path><path d="m22 3-5 5"></path><path d="m17 3 5 5"></path>`
};
