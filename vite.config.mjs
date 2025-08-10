import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 5003,
    host: '0.0.0.0',
    allowedHosts: 'all'
  },
  preview: {
    port: 5003,
    host: '0.0.0.0',
    allowedHosts: 'all'
  },
  build: {
    // 소스 맵 생성
    sourcemap: true,
    rollupOptions: {
      output: {
        // CSS chunking 최적화 - 사용하지 않는 CSS preload 방지
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('html-to-image') || id.includes('pdf-lib')) {
              return 'exports'; // 내보내기 관련 라이브러리만 별도 chunk
            }
            return 'vendor';
          }
        },
        // Asset 파일명 최적화
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash].${ext}`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      }
    },
    // CSS 코드 분할 설정
    cssCodeSplit: true,
    // 미사용 CSS 제거
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 프로덕션에서 console.log 제거
        drop_debugger: true,
        pure_funcs: ['console.log']
      }
    }
  },
  optimizeDeps: {
    include: ['html-to-image', 'pdf-lib'],
    force: true
  },
  css: {
    // PostCSS 최적화
    postcss: './postcss.config.js',
    devSourcemap: false // 개발 시에도 CSS sourcemap 비활성화로 성능 향상
  }
});
