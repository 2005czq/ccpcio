import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: 'CCPCIO',
        namespace: 'https://board.xcpcio.com/',
        description:
          '封榜前仅显示过题>=50的题目，封榜后全开；支持正/倒计时跳转。',
        match: ['https://board.xcpcio.com/*', 'http://board.xcpcio.com/*'],
        grant: 'none',
        'run-at': 'document-end',
      },
    }),
  ],
});
