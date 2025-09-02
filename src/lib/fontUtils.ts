import { googleFontsService } from '../services/GoogleFontsService';

/**
 * Get CSS font-family string for a Google Font
 * @param fontFamily - The Google Font family name
 * @param fallbacks - Fallback fonts (optional)
 * @returns CSS font-family string
 */
export const getGoogleFontFamily = (
  fontFamily: string, 
  fallbacks: string[] = ['sans-serif']
): string => {
  const fallbackString = fallbacks.join(', ');
  return `"${fontFamily}", ${fallbackString}`;
};

/**
 * Get all available Google Font families as an array
 * @returns Array of font family names
 */
export const getAvailableFonts = (): string[] => {
  return googleFontsService.getFonts().map(font => font.family);
};

/**
 * Check if a specific Google Font is loaded and available
 * @param fontFamily - The font family name to check
 * @returns boolean indicating if font is loaded
 */
export const isFontAvailable = (fontFamily: string): boolean => {
  return googleFontsService.isFontLoaded(fontFamily);
};

/**
 * Get fonts by category (serif, sans-serif, display, handwriting, monospace)
 * @param category - Font category
 * @returns Array of font family names in that category
 */
export const getFontsByCategory = (category: string): string[] => {
  return googleFontsService.getFontsByCategory(category).map(font => font.family);
};

/**
 * Search for fonts by name
 * @param query - Search query
 * @returns Array of matching font family names
 */
export const searchFonts = (query: string): string[] => {
  return googleFontsService.searchFonts(query).map(font => font.family);
};

/**
 * Get popular Google Fonts
 * @param limit - Number of fonts to return (default: 20)
 * @returns Array of popular font family names
 */
export const getPopularFonts = (limit = 20): string[] => {
  return googleFontsService.getPopularFonts(limit).map(font => font.family);
};

/**
 * Generate CSS custom properties for all loaded fonts
 * This can be used to create CSS variables for easy reference
 * @returns CSS string with custom properties
 */
export const generateFontCSSVariables = (): string => {
  const fonts = googleFontsService.getFonts();
  const cssVars = fonts.map((font, index) => {
    const varName = font.family.toLowerCase().replace(/\s+/g, '-');
    return `  --font-${varName}: "${font.family}", sans-serif;`;
  }).join('\n');
  
  return `:root {\n${cssVars}\n}`;
};

/**
 * Common font combinations for different use cases
 */
export const fontCombinations = {
  modern: {
    heading: 'Inter',
    body: 'Inter',
    accent: 'Space Grotesk'
  },
  elegant: {
    heading: 'Playfair Display',
    body: 'Source Sans Pro',
    accent: 'Cormorant Garamond'
  },
  clean: {
    heading: 'Montserrat',
    body: 'Open Sans',
    accent: 'Lato'
  },
  creative: {
    heading: 'Poppins',
    body: 'Nunito',
    accent: 'Quicksand'
  },
  professional: {
    heading: 'Roboto',
    body: 'Roboto',
    accent: 'Roboto Slab'
  }
};

/**
 * Get a font combination for a specific style
 * @param style - Style name (modern, elegant, clean, creative, professional)
 * @returns Object with heading, body, and accent fonts
 */
export const getFontCombination = (style: keyof typeof fontCombinations) => {
  return fontCombinations[style];
}; 