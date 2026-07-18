import { readFileSync } from 'node:fs';

export interface ColorToken {
  main: string;
  light?: string;
  dark?: string;
  contrast?: string;
}

export interface TypographyToken {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
}

export interface MotionToken {
  duration: Map<string, string>;
  easing: Map<string, string>;
}

export interface TokenMap {
  spacing: Map<string, string>;
  colors: Map<string, ColorToken>;
  typography: Map<string, TypographyToken>;
  radius: Map<string, string>;
  shadow: Map<string, string>;
  breakpoints: Map<string, string>;
  zIndex: Map<string, string>;
  motion: MotionToken;
}

export function parseTokens(filePath: string): TokenMap {
  let content: string;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch {
    throw new Error(`Token file not found: ${filePath}. Run '@company/tokens build' first.`);
  }

  const tokenMap: TokenMap = {
    spacing: new Map(),
    colors: new Map(),
    typography: new Map(),
    radius: new Map(),
    shadow: new Map(),
    breakpoints: new Map(),
    zIndex: new Map(),
    motion: { duration: new Map(), easing: new Map() },
  };

  // Match all CSS custom properties starting with --ds-
  const propertyRegex = /--ds-(spacing|color|typography|radius|shadow|breakpoint|z-index|motion)-([^:]+):\s*([^;]+);/g;
  let match: RegExpExecArray | null;
  let tokenCount = 0;

  while ((match = propertyRegex.exec(content)) !== null) {
    tokenCount++;
    const [, category, rest, value] = match;

    switch (category) {
      case 'spacing': {
        tokenMap.spacing.set(rest, value.trim());
        break;
      }
      case 'color': {
        // Pattern: {colorName}-{variant} e.g. primary-main, primary-light
        const lastDash = rest.lastIndexOf('-');
        if (lastDash === -1) break;
        const colorName = rest.substring(0, lastDash);
        const variant = rest.substring(lastDash + 1);

        if (!tokenMap.colors.has(colorName)) {
          tokenMap.colors.set(colorName, { main: '' });
        }
        const colorToken = tokenMap.colors.get(colorName)!;

        if (variant === 'main') colorToken.main = value.trim();
        else if (variant === 'light') colorToken.light = value.trim();
        else if (variant === 'dark') colorToken.dark = value.trim();
        else if (variant === 'contrast') colorToken.contrast = value.trim();
        break;
      }
      case 'typography': {
        // Pattern: {group}-{size}-{property} e.g. body-md-font-size
        // Properties: font-family, font-size, font-weight, line-height, letter-spacing
        const properties = ['font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing'];
        let matchedProp: string | null = null;
        let tokenKey: string | null = null;

        for (const prop of properties) {
          if (rest.endsWith(prop)) {
            matchedProp = prop;
            tokenKey = rest.substring(0, rest.length - prop.length - 1); // remove trailing dash + prop
            break;
          }
        }

        if (!matchedProp || !tokenKey) break;

        if (!tokenMap.typography.has(tokenKey)) {
          tokenMap.typography.set(tokenKey, {
            fontFamily: '',
            fontSize: '',
            fontWeight: '',
            lineHeight: '',
            letterSpacing: '',
          });
        }
        const typoToken = tokenMap.typography.get(tokenKey)!;

        if (matchedProp === 'font-family') typoToken.fontFamily = value.trim();
        else if (matchedProp === 'font-size') typoToken.fontSize = value.trim();
        else if (matchedProp === 'font-weight') typoToken.fontWeight = value.trim();
        else if (matchedProp === 'line-height') typoToken.lineHeight = value.trim();
        else if (matchedProp === 'letter-spacing') typoToken.letterSpacing = value.trim();
        break;
      }
      case 'radius': {
        tokenMap.radius.set(rest, value.trim());
        break;
      }
      case 'shadow': {
        tokenMap.shadow.set(rest, value.trim());
        break;
      }
      case 'breakpoint': {
        tokenMap.breakpoints.set(rest, value.trim());
        break;
      }
      case 'z-index': {
        tokenMap.zIndex.set(rest, value.trim());
        break;
      }
      case 'motion': {
        // Pattern: {duration|easing}-{key} e.g. duration-fast, easing-ease-in-out
        if (rest.startsWith('duration-')) {
          tokenMap.motion.duration.set(rest.substring('duration-'.length), value.trim());
        } else if (rest.startsWith('easing-')) {
          tokenMap.motion.easing.set(rest.substring('easing-'.length), value.trim());
        }
        break;
      }
    }
  }

  if (tokenCount === 0) {
    throw new Error(`No tokens found in ${filePath}. The token file appears to be empty or malformed.`);
  }

  return tokenMap;
}
