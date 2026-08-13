import { defineConfig, transformWithEsbuild } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { visualizer } from 'rollup-plugin-visualizer'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import os from 'node:os'

function resolveHome(p) {
  return p?.startsWith('~/') ? p.replace('~', os.homedir()) : p
}

export default defineConfig(() => {
  const certFile = resolveHome(process.env.SSL_CRT_FILE)
  const keyFile = resolveHome(process.env.SSL_KEY_FILE)
  const httpsConfig =
    certFile && keyFile
      ? { cert: fs.readFileSync(certFile), key: fs.readFileSync(keyFile) }
      : undefined

  return {
    base: './',
    resolve: {
      alias: {
        fs: fileURLToPath(new URL('./src/stubs/fs.js', import.meta.url)),
        'source-map-js': fileURLToPath(
          new URL('./src/stubs/source-map-js.js', import.meta.url)
        ),
      },
    },
    optimizeDeps: {
      include: [
        'postcss',
        'exceljs',
        'file-saver',
        'docx',
        '@mui/x-charts/LineChart',
        '@mui/x-charts/PieChart',
      ],
      esbuildOptions: {
        loader: { '.js': 'jsx' },
        jsx: 'automatic',
      },
    },
    build: {
      outDir: 'build',
    },
    plugins: [
      nodePolyfills({ exclude: ['fs'] }),
      react(),
      svgr({ svgrOptions: { icon: true } }),
      {
        name: 'load+transform-js-files-as-jsx',
        async transform(code, id) {
          if (!id.match(/src\/.*\.js$/)) {
            return null
          }
          return transformWithEsbuild(code, id, {
            loader: 'jsx',
            jsx: 'automatic',
          })
        },
      },
      process.env.ANALYZE === 'true' &&
        visualizer({
          filename: 'build/stats.html',
          template: 'treemap',
          gzipSize: true,
          brotliSize: true,
          open: true,
        }),
    ],
    server: {
      host: '0.0.0.0',
      port: 3000,
      open: true,
      https: httpsConfig,
      watch:
        process.env.VITE_USE_POLLING === 'true'
          ? { usePolling: true, interval: 300 }
          : undefined,
    },
  }
})
