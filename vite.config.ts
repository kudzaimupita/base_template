import { defineConfig } from 'vite';
import dynamicImport from 'vite-plugin-dynamic-import';
import path from 'path';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // babel: {
      //   plugins: [''],
      // },
    }),
    dynamicImport(),
  ],
  assetsInclude: ['**/*.md', '**/*.ttf', '**/*.otf', '**/*.woff', '**/*.woff2'],
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'build',
    // Increase chunk size limit
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // manualChunks: {
        //   // Split vendor chunks
        //   'vendor-react': ['react', 'react-dom'],
        //   'vendor-mui': ['@mui/material', '@mui/icons-material'],
        //   'vendor-ant': ['antd', '@ant-design/icons'],
        //   'vendor-charts': ['recharts', '@ant-design/charts', 'apexcharts'],
        //   'vendor-forms': ['react-hook-form', 'formik', 'yup', 'zod'],
        //   'vendor-editors': ['@ckeditor/ckeditor5-react', 'react-quill'],
        //   'vendor-utils': ['lodash', 'axios', 'dayjs'],
        //   'vendor-fonts': ['./src/generated-fonts.css']
        // },
        // Reduce the number of chunks
        experimentalMinChunkSize: 10000,
        // Optimize chunk distribution
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/') : [];
          const name = facadeModuleId[facadeModuleId.length - 2] || '[name]';
          return `js/${name}/[name].[hash].js`;
        },
      },
    },
    // Improve memory usage during build
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    // Clean output directory before build
    emptyOutDir: true,
  },
  // Optimize dev server
  server: {
    hmr: {
      overlay: false,
    },
    watch: {
      usePolling: false,
      ignored: ['**/node_modules/**', '**/dist/**'],
    },
  },
  // Optimize dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'lodash',
      'antd',
      // '@mui/material'
    ],
    exclude: ['@fullcalendar/react'],
  },
  // Reduce memory usage during pre-bundling
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
});
