import { message } from 'antd';

// Google Fonts API configuration - matches FontPicker implementation
const GOOGLE_FONTS_API_KEY = import.meta.env.VITE_GOOGLE_FONTS_API_KEY;
const GOOGLE_FONTS_API_URL = 'https://www.googleapis.com/webfonts/v1/webfonts';
// Same cache key as FontPicker
const CACHE_KEY = 'googleFontsCache';
// Same expiry key as FontPicker
const CACHE_EXPIRY_KEY = 'googleFontsCacheExpiry';
// 7 days - same as FontPicker
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

// Popular fonts to load by default for better performance
const DEFAULT_FONTS = [
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Inter',
  'Playfair Display',
  'Raleway',
  'Ubuntu',
  'Nunito',
  'Merriweather',
  'Work Sans',
  'Quicksand',
  'Mulish',
  'Manrope',
  'DM Sans',
  'Space Grotesk',
  'Plus Jakarta Sans',
  'Outfit',
  'Sora'
];

export interface GoogleFont {
  family: string;
  variants: string[];
  subsets: string[];
  category: string;
  files?: Record<string, string>;
}

class GoogleFontsService {
  private fonts: GoogleFont[] = [];
  private loadedFonts: Set<string> = new Set();
  private fontLink: HTMLLinkElement | null = null;
  private initialized = false;

  /**
   * Initialize Google Fonts service and load font list
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Fetch font list from Google Fonts API
      await this.fetchFontList();
      
      // Load ALL fonts immediately for use in styles
      await this.preloadAllFonts();
      
      this.initialized = true;
      message.success(`Loaded ${this.fonts.length} Google Fonts for styling`);
  
    } catch (error) {
      // Use fallback font list if API fails
      this.useFallbackFonts();
      // Still load fallback fonts
      await this.preloadAllFonts();
      message.warning('Google Fonts API unavailable, using fallback fonts');
    }
  }

  /**
   * Fetch font list from Google Fonts API - matches FontPicker's implementation
   */
  private async fetchFontList(): Promise<void> {
    // Check if API key is configured
    if (!GOOGLE_FONTS_API_KEY || GOOGLE_FONTS_API_KEY === 'YOUR_GOOGLE_FONTS_API_KEY_HERE') {
      this.loadCachedFonts();
      return;
    }

    // Check cache first
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cacheExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);

    if (cachedData && cacheExpiry) {
      const expiryTime = parseInt(cacheExpiry);
      if (Date.now() < expiryTime) {
        // Cache is still valid
        try {
          this.fonts = JSON.parse(cachedData);
          return;
        } catch (e) {
          // Error parsing cached fonts, will fetch fresh data
        }
      }
    }

    // Fetch fresh data from API
    try {
      const response = await fetch(`${GOOGLE_FONTS_API_URL}?key=${GOOGLE_FONTS_API_KEY}&sort=popularity`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch fonts: ${response.status}`);
      }

      const data = await response.json();
      this.fonts = data.items || [];
      
      // Store in localStorage with expiry - same as FontPicker
      localStorage.setItem(CACHE_KEY, JSON.stringify(this.fonts));
      localStorage.setItem(CACHE_EXPIRY_KEY, String(Date.now() + CACHE_DURATION));
      
    } catch (error) {
      this.loadCachedFonts();
    }
  }

  /**
   * Load cached fonts from localStorage - uses same cache key as FontPicker
   */
  private loadCachedFonts(): void {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        this.fonts = JSON.parse(cached);
      } catch (error) {
        this.useFallbackFonts();
      }
    } else {
      this.useFallbackFonts();
    }
  }

  /**
   * Use fallback font list when API is unavailable
   */
  private useFallbackFonts(): void {
    this.fonts = DEFAULT_FONTS.map(family => ({
      family,
      variants: ['regular', '500', '600', '700'],
      subsets: ['latin'],
      category: 'sans-serif'
    }));
  }

  /**
   * Preload all available fonts for immediate use in styles
   */
  private async preloadAllFonts(): Promise<void> {
    // Create preconnect links for Google Fonts
    const preconnect1 = document.querySelector('link[href="https://fonts.googleapis.com"]');
    if (!preconnect1) {
      const pc1 = document.createElement('link');
      pc1.rel = 'preconnect';
      pc1.href = 'https://fonts.googleapis.com';
      document.head.appendChild(pc1);
    }

    const preconnect2 = document.querySelector('link[href="https://fonts.gstatic.com"]');
    if (!preconnect2) {
      const pc2 = document.createElement('link');
      pc2.rel = 'preconnect';
      pc2.href = 'https://fonts.gstatic.com';
      pc2.crossOrigin = 'anonymous';
      document.head.appendChild(pc2);
    }

    // Load all fonts in batches to avoid overwhelming the browser
    const batchSize = 50;
    const totalFonts = this.fonts.length;
    
    for (let i = 0; i < totalFonts; i += batchSize) {
      const batch = this.fonts.slice(i, i + batchSize);
      
      // Create a single CSS link for this batch
      const fontFamilies = batch.map(font => {
        const encodedName = encodeURIComponent(font.family).replace(/%20/g, '+');
        // Use common weights for all fonts
        return `${encodedName}:wght@300;400;500;600;700`;
      }).join('&family=');
      
      const batchUrl = `https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap`;
      
      const link = document.createElement('link');
      link.id = `google-fonts-batch-${Math.floor(i / batchSize)}`;
      link.rel = 'stylesheet';
      link.href = batchUrl;
      document.head.appendChild(link);
      
      // Track loaded fonts
      batch.forEach(font => this.loadedFonts.add(font.family));
      
      // Small delay between batches to prevent browser overload
      if (i + batchSize < totalFonts) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  /**
   * Load a specific font with variants - matches FontPicker's approach
   */
  loadFont(family: string, variants: string[] = ['400']): void {
    // Find the font in our list
    const googleFont = this.fonts.find(f => f.family === family);
    
    if (googleFont) {
      // Use all available variants if found
      const availableVariants = googleFont.variants || ['regular'];
      const weights = [...new Set(
        availableVariants.map(v => {
          const weight = v.replace('italic', '').trim();
          return weight === 'regular' ? '400' : weight;
        })
      )].filter(w => w && !isNaN(parseInt(w)));
      
      variants = weights.length > 0 ? weights : variants;
    }

    // Create unique link ID for this font - same as FontPicker
    const linkId = `google-font-${family.replace(/[\s+]/g, '-').toLowerCase()}`;
    
    if (document.getElementById(linkId)) {
      // Font already loaded
      return;
    }

    // Build weights string
    const weightsStr = variants.join(';');
    const encodedFontName = encodeURIComponent(family).replace(/%20/g, '+');
    const fontUrl = `https://fonts.googleapis.com/css2?family=${encodedFontName}:wght@${weightsStr}&display=swap`;

    // Create link element with ID
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = fontUrl;
    document.head.appendChild(link);
    
    this.loadedFonts.add(family);
  }

  /**
   * Unload a specific font
   */
  unloadFont(family: string): void {
    const linkId = `google-font-${family.replace(/[\s+]/g, '-').toLowerCase()}`;
    const link = document.getElementById(linkId);
    
    if (link) {
      link.remove();
      this.loadedFonts.delete(family);
    }
  }

  /**
   * Load multiple fonts at once
   */
  loadFonts(fontFamilies: string[], variants: string[] = ['400']): void {
    fontFamilies.forEach(family => {
      this.loadFont(family, variants);
    });
  }

  /**
   * Get all available fonts
   */
  getFonts(): GoogleFont[] {
    return this.fonts;
  }

  /**
   * Get fonts by category
   */
  getFontsByCategory(category: string): GoogleFont[] {
    return this.fonts.filter(font => font.category === category);
  }

  /**
   * Search fonts by name
   */
  searchFonts(query: string): GoogleFont[] {
    const lowerQuery = query.toLowerCase();
    return this.fonts.filter(font => 
      font.family.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get font categories
   */
  getCategories(): string[] {
    const categories = new Set(this.fonts.map(font => font.category));
    return Array.from(categories).sort();
  }

  /**
   * Check if a font is loaded
   */
  isFontLoaded(family: string): boolean {
    // Check if link element exists - matches FontPicker's approach
    const linkId = `google-font-${family.replace(/[\s+]/g, '-').toLowerCase()}`;
    return !!document.getElementById(linkId) || this.loadedFonts.has(family);
  }

  /**
   * Get popular fonts
   */
  getPopularFonts(limit = 20): GoogleFont[] {
    return this.fonts.slice(0, limit);
  }

  /**
   * Get loaded fonts
   */
  getLoadedFonts(): string[] {
    return Array.from(this.loadedFonts);
  }

  /**
   * Clear font cache
   */
  clearCache(): void {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_EXPIRY_KEY);
  }

  /**
   * Refresh font list from API
   */
  async refreshFonts(): Promise<void> {
    this.clearCache();
    await this.fetchFontList();
    message.success('Font list refreshed successfully');
  }

  /**
   * Get font by family name
   */
  getFont(family: string): GoogleFont | undefined {
    return this.fonts.find(font => font.family === family);
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get font count
   */
  getFontCount(): number {
    return this.fonts.length;
  }

  /**
   * Load font with custom CSS
   */
  loadCustomFont(family: string, cssUrl: string): void {
    const linkId = `custom-font-${family.replace(/[\s+]/g, '-').toLowerCase()}`;
    
    if (document.getElementById(linkId)) {
      // Font already loaded
      return;
    }

    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = cssUrl;
    document.head.appendChild(link);
    
    this.loadedFonts.add(family);
  }
}

// Export singleton instance
export const googleFontsService = new GoogleFontsService();

// Export but don't auto-initialize - let App.tsx handle initialization
export default googleFontsService; 