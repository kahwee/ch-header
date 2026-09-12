import type { StorybookConfig } from '@storybook/html-vite'

const config: StorybookConfig = {
  stories: ['../src/ui/**/__stories__/**/*.stories.ts'],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  staticDirs: ['../public'],
  viteFinal: async (config) => ({
    ...config,
    build: {
      ...config.build,
      chunkSizeWarningLimit: 1000,
    },
  }),
}
export default config
