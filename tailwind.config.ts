// tailwind.config.ts (optional for v4)
import type { Config } from 'tailwindcss'

export default {
  // v4 dark mode tuple requires the selector; '.dark' is the default
  darkMode: ['class', '.dark'],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
