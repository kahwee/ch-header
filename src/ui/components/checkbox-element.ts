/**
 * Web component for a checkbox with lucide-style square icons
 * Usage: <ch-checkbox checked data-role="enabled"></ch-checkbox>
 */
import squareIcon from '../icons/square.svg?raw'
import squareCheckBigIcon from '../icons/square-check-big.svg?raw'

const CHECKBOX_TEMPLATE = `
  <div class="checkbox-container">
    <input type="checkbox" class="checkbox-input" />
    <div class="checkbox-icon unchecked">${squareIcon}</div>
    <div class="checkbox-icon checked">${squareCheckBigIcon}</div>
  </div>
`

const CHECKBOX_STYLES = `
  :host {
    display: inline-flex;
    flex-shrink: 0;
  }

  .checkbox-container {
    position: relative;
    width: 1.5rem;
    height: 1.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .checkbox-input {
    position: absolute;
    width: 100%;
    height: 100%;
    appearance: none;
    cursor: pointer;
    margin: 0;
    padding: 0;
    opacity: 0;
    z-index: 10;
  }

  .checkbox-input:focus-visible {
    outline: 2px solid rgb(99 102 241);
    outline-offset: 2px;
  }

  .checkbox-input:disabled {
    cursor: not-allowed;
  }

  .checkbox-icon {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    transition: opacity 0.2s ease;
    color: rgb(99 102 241);
  }

  .checkbox-icon svg {
    width: 100%;
    height: 100%;
    stroke: currentColor;
  }

  .checkbox-icon.unchecked {
    opacity: 1;
    color: rgb(255 255 255 / 0.4);
  }

  .checkbox-icon.checked {
    opacity: 0;
  }

  .checkbox-input:checked ~ .checkbox-icon.unchecked {
    opacity: 0;
  }

  .checkbox-input:checked ~ .checkbox-icon.checked {
    opacity: 1;
  }

  .checkbox-input:disabled ~ .checkbox-icon {
    color: rgb(255 255 255 / 0.2);
    cursor: not-allowed;
  }

  .checkbox-input:disabled:checked ~ .checkbox-icon.checked {
    opacity: 1;
  }

  .checkbox-input:indeterminate ~ .checkbox-icon.unchecked {
    opacity: 0;
  }

  .checkbox-input:indeterminate ~ .checkbox-icon.checked {
    opacity: 1;
  }
`

export class CheckboxElement extends HTMLElement {
  private input!: HTMLInputElement

  constructor() {
    super()
    const sr = this.attachShadow({ mode: 'open' })
    if (sr) {
      this.setupShadowDOM(sr)
    }
  }

  private setupShadowDOM(shadowRoot: ShadowRoot) {
    const template = document.createElement('template')
    template.innerHTML = `
      <style>${CHECKBOX_STYLES}</style>
      ${CHECKBOX_TEMPLATE}
    `

    shadowRoot.appendChild(template.content.cloneNode(true))
    this.input = shadowRoot.querySelector('.checkbox-input')!
  }

  connectedCallback() {
    this.setupEventListeners()
  }

  private setupEventListeners() {
    this.input.addEventListener('change', () => {
      this.dispatchEvent(
        new Event('change', {
          bubbles: true,
          composed: true,
        })
      )
    })

    this.input.addEventListener('input', () => {
      this.dispatchEvent(
        new Event('input', {
          bubbles: true,
          composed: true,
        })
      )
    })
  }

  // Reflect 'checked' attribute to property
  get checked(): boolean {
    return this.input?.checked ?? false
  }

  set checked(value: boolean) {
    if (this.input) {
      this.input.checked = value
    }
    if (value) {
      this.setAttribute('checked', '')
    } else {
      this.removeAttribute('checked')
    }
  }

  // Reflect 'disabled' attribute to property
  get disabled(): boolean {
    return this.hasAttribute('disabled')
  }

  set disabled(value: boolean) {
    if (this.input) {
      this.input.disabled = value
    }
    if (value) {
      this.setAttribute('disabled', '')
    } else {
      this.removeAttribute('disabled')
    }
  }

  // Support 'indeterminate' state
  get indeterminate(): boolean {
    return this.input?.indeterminate ?? false
  }

  set indeterminate(value: boolean) {
    if (this.input) {
      this.input.indeterminate = value
    }
  }

  // Observe attribute changes
  static get observedAttributes() {
    return ['checked', 'disabled', 'data-role']
  }

  attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
    if (!this.input) return

    switch (name) {
      case 'checked':
        this.input.checked = newValue !== null
        break
      case 'disabled':
        this.input.disabled = newValue !== null
        break
      case 'data-role':
        // data-role is passed through via the element attribute
        break
    }
  }
}

// Register the custom element
customElements.define('ch-checkbox', CheckboxElement)
