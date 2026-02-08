declare module 'reveal.js/plugin/highlight/highlight.esm.js' {
  const plugin: unknown;
  export default plugin;
}

declare module 'reveal.js' {
  interface RevealOptions {
    embedded?: boolean;
    hash?: boolean;
    controls?: boolean;
    progress?: boolean;
    center?: boolean;
    transition?: string;
    [key: string]: unknown;
  }
  interface RevealInstance {
    initialize(options?: RevealOptions): Promise<void>;
    destroy(): void;
    getState(): { indexh: number; indexv: number };
    on(event: string, callback: (...args: unknown[]) => void): void;
    slide(h: number, v?: number, f?: number): void;
  }
  class Reveal {
    constructor(element: HTMLElement, options?: RevealOptions);
    initialize(options?: RevealOptions): Promise<void>;
    destroy(): void;
    getState(): { indexh: number; indexv: number };
    on(event: string, callback: (...args: unknown[]) => void): void;
    slide(h: number, v?: number, f?: number): void;
  }
  export default Reveal;
}
