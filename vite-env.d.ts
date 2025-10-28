/// <reference types="vite/client" />

interface HTMLButtonElement {
  popovertarget?: string;
}

declare module '*.svg?raw' {
  const content: string
  export default content
}

declare module '*.svg' {
  const content: string
  export default content
}
