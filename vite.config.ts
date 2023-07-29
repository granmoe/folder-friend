import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    watch: process.env.NODE_ENV === 'production' ? undefined : {},
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'folder-friend',
      // the proper extensions will be added
      fileName: 'index',
    },
    rollupOptions: {
      // externalize deps that shouldn't be bundled into your library
      external: ['react'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
})
