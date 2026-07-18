/**
 * Generate static reset/normalize CSS.
 * This layer ensures all Supported Platforms start from a consistent baseline.
 * No token dependency — purely structural resets.
 */
export function generateReset(): string {
  return `*, *::before, *::after {
  box-sizing: border-box;
}

body, h1, h2, h3, h4, h5, h6, p, ul, ol, figure, blockquote, pre {
  margin: 0;
  padding: 0;
}

img, video, svg {
  max-width: 100%;
  display: block;
}

button, input, textarea, select {
  appearance: none;
  font: inherit;
}`;
}
