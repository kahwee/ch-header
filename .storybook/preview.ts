import type { Preview, Decorator } from '@storybook/html'
import '@tailwindplus/elements'
import '../src/ui/core/styles.css'
import '../src/ui/components/common/checkbox-element'

/**
 * Chrome Extension Layout Decorator
 * Wraps stories in a container matching the chrome extension popup dimensions.
 * Use `layout: 'fullscreen'` in story parameters to apply this decorator.
 */
const chromeExtensionDecorator: Decorator = (story, context) => {
  // Only apply to fullscreen layout stories (extension layouts)
  if (context.parameters.layout === 'fullscreen') {
    const wrapper = document.createElement('div')
    wrapper.className = 'chrome-extension-viewport'
    wrapper.style.width = '800px'
    wrapper.style.height = '600px'
    wrapper.style.overflow = 'hidden'
    wrapper.style.display = 'flex'
    wrapper.style.margin = '0 auto'

    const storyResult = story()
    if (storyResult instanceof HTMLElement) {
      wrapper.appendChild(storyResult)
    }
    return wrapper
  }

  return story()
}

const preview: Preview = {
  decorators: [chromeExtensionDecorator],
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
