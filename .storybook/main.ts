import type { StorybookConfig } from '@storybook/html-vite'

const config: StorybookConfig = {
  stories: ['../src/ui/**/__stories__/**/*.stories.ts'],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  staticDirs: ['../public'],
}
export default config
