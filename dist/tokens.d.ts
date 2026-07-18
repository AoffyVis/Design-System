export interface DesignTokens {
  breakpoint: {
    "2xl": string;
    lg: string;
    md: string;
    sm: string;
    xl: string;
  };
  color: {
    border: {
      main: string;
    };
    error: {
      contrast: string;
      main: string;
    };
    info: {
      contrast: string;
      main: string;
    };
    primary: {
      contrast: string;
      dark: string;
      light: string;
      main: string;
    };
    secondary: {
      contrast: string;
      dark: string;
      light: string;
      main: string;
    };
    success: {
      contrast: string;
      main: string;
    };
    surface: {
      contrast: string;
      main: string;
    };
    warning: {
      contrast: string;
      main: string;
    };
  };
  motion: {
    duration: {
      fast: string;
      instant: string;
      normal: string;
      slow: string;
      slower: string;
    };
    easing: {
      in: string;
      inOut: string;
      linear: string;
      out: string;
    };
  };
  radius: {
    "2xl": string;
    full: string;
    lg: string;
    md: string;
    none: string;
    sm: string;
    xl: string;
  };
  shadow: {
    "2xl": string;
    inner: string;
    lg: string;
    md: string;
    none: string;
    sm: string;
    xl: string;
  };
  spacing: {
    "0": string;
    "1": string;
    "10": string;
    "12": string;
    "16": string;
    "2": string;
    "3": string;
    "4": string;
    "5": string;
    "6": string;
    "8": string;
  };
  typography: {
    body: {
      md: {
        fontFamily: string;
        fontSize: string;
        fontWeight: number;
        letterSpacing: string;
        lineHeight: number;
      };
      sm: {
        fontFamily: string;
        fontSize: string;
        fontWeight: number;
        letterSpacing: string;
        lineHeight: number;
      };
    };
    heading: {
      h1: {
        fontFamily: string;
        fontSize: string;
        fontWeight: number;
        letterSpacing: string;
        lineHeight: number;
      };
      h2: {
        fontFamily: string;
        fontSize: string;
        fontWeight: number;
        letterSpacing: string;
        lineHeight: number;
      };
    };
  };
  zIndex: {
    base: number;
    dropdown: number;
    fixed: number;
    hide: number;
    modal: number;
    overlay: number;
    popover: number;
    sticky: number;
    tooltip: number;
  };
}

export declare const tokens: DesignTokens;
