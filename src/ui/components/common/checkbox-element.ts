/**
 * Web component for a checkbox with SVG checkmark icon
 * Usage: <ch-checkbox checked data-role="enabled"></ch-checkbox>
 */

const CHECKBOX_TEMPLATE = `
  <div class="group">
    <input type="checkbox" class="checkbox-input" />
    <svg viewBox="0 0 14 14" fill="none" class="checkbox-icon">
      <path d="M3 8L6 11L11 3.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="checkmark" />
      <path d="M3 7H11" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="indeterminate" />
    </svg>
  </div>
`

const CHECKBOX_STYLES = `
  :host {
    display: inline-flex;
    flex-shrink: 0;
  }

  .group {
    position: relative;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    width: 16px;
    height: 16px;
  }

  .checkbox-input {
    grid-column: 1;
    grid-row: 1;
    appearance: none;
    border-radius: 0.125rem;
    border: 1px solid var(--line-strong, #5f6368);
    background-color: var(--field, #292a2d);
    cursor: pointer;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    transition: all 0.2s ease;
  }

  .checkbox-input:checked {
    border-color: var(--accent, #8ab4f8);
    background-color: var(--accent, #8ab4f8);
  }

  .checkbox-input:indeterminate {
    border-color: var(--accent, #8ab4f8);
    background-color: var(--accent, #8ab4f8);
  }

  .checkbox-input:focus-visible {
    outline: 2px solid var(--accent, #8ab4f8);
    outline-offset: 2px;
  }

  :host([switch]) .group {
    width: 32px;
    height: 18px;
  }
  :host([switch]) .checkbox-input {
    border-radius: 10px;
    background: var(--line-strong, #5f6368);
  }
  :host([switch]) .checkbox-input::after {
    content: '';
    display: block;
    width: 12px;
    height: 12px;
    margin: 2px;
    border-radius: 50%;
    background: var(--switch-thumb, #e8eaed);
    transition: transform 140ms;
  }
  :host([switch]) .checkbox-input:checked {
    background: var(--accent, #8ab4f8);
  }
  :host([switch]) .checkbox-input:checked::after {
    transform: translateX(14px);
    background: var(--on-accent, #202124);
  }
  :host([switch]) .checkbox-icon {
    display: none;
  }

  .checkbox-input:disabled {
    border-color: rgb(255 255 255 / 0.05);
    background-color: rgb(255 255 255 / 0.1);
    cursor: not-allowed;
  }

  .checkbox-input:disabled:checked {
    background-color: rgb(255 255 255 / 0.1);
  }

  .checkbox-icon {
    grid-column: 1;
    grid-row: 1;
    pointer-events: none;
    width: 0.875rem;
    height: 0.875rem;
    align-self: center;
    justify-self: center;
    stroke: var(--on-accent, #202124);
    stroke-width: 2;
  }

  .checkbox-icon .checkmark {
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .checkbox-icon .indeterminate {
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .checkbox-input:checked ~ .checkbox-icon .checkmark {
    opacity: 1;
  }

  .checkbox-input:indeterminate ~ .checkbox-icon .indeterminate {
    opacity: 1;
  }

  .checkbox-input:disabled ~ .checkbox-icon {
    stroke: rgb(255 255 255 / 0.25);
  }

  @supports (forced-color-adjust: none) {
    .checkbox-input {
      forced-color-adjust: none;
    }
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
    this.input.setAttribute(
      'aria-label',
      this.getAttribute('aria-label') || this.title || 'Enabled'
    )
    if (this.hasAttribute('switch')) this.input.setAttribute('role', 'switch')
    this.setupEventListeners()
  }

  private setupEventListeners() {
    this.input.addEventListener('change', (event) => {
      event.stopPropagation()
      this.dispatchEvent(
        new Event('change', {
          bubbles: true,
          composed: true,
        })
      )
    })

    this.input.addEventListener('input', (event) => {
      event.stopPropagation()
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
