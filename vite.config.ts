import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Dev server stays at /, production build targets the CromBlog deployment path
  base: command === 'build' ? '/pomodoro-clock/' : '/',
}))
