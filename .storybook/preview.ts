import type { Preview } from '@storybook/html'
import '@tailwindplus/elements'
import '../src/ui/styles.css'
import '../src/ui/components/checkbox-element'

const preview: Preview = {
  parameters: {
    layout: 'centered',
    viewport: {
      viewports: {
        popup: {
          name: 'ChHeader Popup',
          styles: {
            width: '800px',
            height: '600px',
          },
        },
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
      },
      defaultViewport: 'popup',
    },
  },
}

export default preview
