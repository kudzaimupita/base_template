const fs = require('fs')
const plugin = require('tailwindcss/plugin')
const crypto = require('crypto')

// Comprehensive generator that includes ALL Tailwind utilities
const generator = (theme) => (patterns = []) => {
  const safelist = new Set()
  
  // Helper function to add classes safely
  const addClass = (className) => {
    if (className && typeof className === 'string') {
      safelist.add(className)
    }
  }

  // Get all theme values
  const spacing = theme('spacing') || {}
  const colors = theme('colors') || {}
  const screens = theme('screens') || {}
  
  // SPACING UTILITIES (Padding, Margin, Space)
  Object.keys(spacing).forEach(key => {
    // Padding
    addClass(`p-${key}`)
    addClass(`px-${key}`)
    addClass(`py-${key}`)
    addClass(`pt-${key}`)
    addClass(`pr-${key}`)
    addClass(`pb-${key}`)
    addClass(`pl-${key}`)
    addClass(`ps-${key}`)
    addClass(`pe-${key}`)
    
    // Margin
    addClass(`m-${key}`)
    addClass(`mx-${key}`)
    addClass(`my-${key}`)
    addClass(`mt-${key}`)
    addClass(`mr-${key}`)
    addClass(`mb-${key}`)
    addClass(`ml-${key}`)
    addClass(`ms-${key}`)
    addClass(`me-${key}`)
    
    // Negative margins (skip for 0)
    if (key !== '0') {
      addClass(`-m-${key}`)
      addClass(`-mx-${key}`)
      addClass(`-my-${key}`)
      addClass(`-mt-${key}`)
      addClass(`-mr-${key}`)
      addClass(`-mb-${key}`)
      addClass(`-ml-${key}`)
      addClass(`-ms-${key}`)
      addClass(`-me-${key}`)
    }
    
    // Space between
    addClass(`space-x-${key}`)
    addClass(`space-y-${key}`)
    if (key !== '0') {
      addClass(`-space-x-${key}`)
      addClass(`-space-y-${key}`)
    }
    
    // Gap
    addClass(`gap-${key}`)
    addClass(`gap-x-${key}`)
    addClass(`gap-y-${key}`)
    
    // Inset positioning
    addClass(`inset-${key}`)
    addClass(`inset-x-${key}`)
    addClass(`inset-y-${key}`)
    addClass(`top-${key}`)
    addClass(`right-${key}`)
    addClass(`bottom-${key}`)
    addClass(`left-${key}`)
    addClass(`start-${key}`)
    addClass(`end-${key}`)
    
    // Negative insets
    if (key !== '0') {
      addClass(`-inset-${key}`)
      addClass(`-inset-x-${key}`)
      addClass(`-inset-y-${key}`)
      addClass(`-top-${key}`)
      addClass(`-right-${key}`)
      addClass(`-bottom-${key}`)
      addClass(`-left-${key}`)
      addClass(`-start-${key}`)
      addClass(`-end-${key}`)
    }
  })
  
  // SIZING UTILITIES
  const sizingValues = { ...spacing, ...theme('width'), ...theme('height') }
  Object.keys(sizingValues).forEach(key => {
    addClass(`w-${key}`)
    addClass(`min-w-${key}`)
    addClass(`max-w-${key}`)
    addClass(`h-${key}`)
    addClass(`min-h-${key}`)
    addClass(`max-h-${key}`)
    addClass(`size-${key}`) // New in Tailwind v3.4
  })
  
  // COLOR UTILITIES - Comprehensive color generation
  const generateColorClasses = (colorName, colorValue) => {
    const colorClasses = [
      'text', 'bg', 'border', 'border-t', 'border-r', 'border-b', 'border-l',
      'border-s', 'border-e', 'border-x', 'border-y',
      'divide', 'outline', 'ring', 'ring-offset', 
      'shadow', 'accent', 'caret', 'fill', 'stroke',
      'decoration', 'from', 'via', 'to'
    ]
    
    if (typeof colorValue === 'object' && colorValue !== null) {
      Object.keys(colorValue).forEach(shade => {
        const fullColor = `${colorName}-${shade}`
        colorClasses.forEach(prefix => {
          addClass(`${prefix}-${fullColor}`)
        })
      })
    } else {
      colorClasses.forEach(prefix => {
        addClass(`${prefix}-${colorName}`)
      })
    }
  }
  
  Object.entries(colors).forEach(([colorName, colorValue]) => {
    generateColorClasses(colorName, colorValue)
  })
  
  // BORDER UTILITIES
  const borderRadius = theme('borderRadius') || {}
  Object.keys(borderRadius).forEach(key => {
    const suffix = key === 'DEFAULT' ? '' : `-${key}`
    addClass(`rounded${suffix}`)
    addClass(`rounded-t${suffix}`)
    addClass(`rounded-r${suffix}`)
    addClass(`rounded-b${suffix}`)
    addClass(`rounded-l${suffix}`)
    addClass(`rounded-tl${suffix}`)
    addClass(`rounded-tr${suffix}`)
    addClass(`rounded-br${suffix}`)
    addClass(`rounded-bl${suffix}`)
    addClass(`rounded-ss${suffix}`)
    addClass(`rounded-se${suffix}`)
    addClass(`rounded-ee${suffix}`)
    addClass(`rounded-es${suffix}`)
  })
  
  const borderWidth = theme('borderWidth') || {}
  Object.keys(borderWidth).forEach(key => {
    const suffix = key === 'DEFAULT' ? '' : `-${key}`
    addClass(`border${suffix}`)
    addClass(`border-t${suffix}`)
    addClass(`border-r${suffix}`)
    addClass(`border-b${suffix}`)
    addClass(`border-l${suffix}`)
    addClass(`border-s${suffix}`)
    addClass(`border-e${suffix}`)
    addClass(`border-x${suffix}`)
    addClass(`border-y${suffix}`)
    addClass(`divide-x${suffix}`)
    addClass(`divide-y${suffix}`)
    addClass(`outline${suffix}`)
    addClass(`ring${suffix}`)
  })
  
  // TYPOGRAPHY
  const fontSize = theme('fontSize') || {}
  Object.keys(fontSize).forEach(key => {
    addClass(`text-${key}`)
  })
  
  const fontWeight = theme('fontWeight') || {}
  Object.keys(fontWeight).forEach(key => {
    addClass(`font-${key}`)
  })
  
  const fontFamily = theme('fontFamily') || {}
  Object.keys(fontFamily).forEach(key => {
    addClass(`font-${key}`)
  })
  
  const lineHeight = theme('lineHeight') || {}
  Object.keys(lineHeight).forEach(key => {
    addClass(`leading-${key}`)
  })
  
  const letterSpacing = theme('letterSpacing') || {}
  Object.keys(letterSpacing).forEach(key => {
    addClass(`tracking-${key}`)
  })
  
  // FLEXBOX & GRID
  const flexBasis = theme('flexBasis') || {}
  Object.keys(flexBasis).forEach(key => {
    addClass(`basis-${key}`)
  })
  
  const flexGrow = theme('flexGrow') || {}
  Object.keys(flexGrow).forEach(key => {
    addClass(`grow-${key}`)
  })
  
  const flexShrink = theme('flexShrink') || {}
  Object.keys(flexShrink).forEach(key => {
    addClass(`shrink-${key}`)
  })
  
  const order = theme('order') || {}
  Object.keys(order).forEach(key => {
    addClass(`order-${key}`)
  })
  
  const gridTemplateColumns = theme('gridTemplateColumns') || {}
  Object.keys(gridTemplateColumns).forEach(key => {
    addClass(`grid-cols-${key}`)
  })
  
  const gridTemplateRows = theme('gridTemplateRows') || {}
  Object.keys(gridTemplateRows).forEach(key => {
    addClass(`grid-rows-${key}`)
  })
  
  const gridColumn = theme('gridColumn') || {}
  Object.keys(gridColumn).forEach(key => {
    addClass(`col-${key}`)
  })
  
  const gridRow = theme('gridRow') || {}
  Object.keys(gridRow).forEach(key => {
    addClass(`row-${key}`)
  })
  
  const gridColumnStart = theme('gridColumnStart') || {}
  Object.keys(gridColumnStart).forEach(key => {
    addClass(`col-start-${key}`)
  })
  
  const gridColumnEnd = theme('gridColumnEnd') || {}
  Object.keys(gridColumnEnd).forEach(key => {
    addClass(`col-end-${key}`)
  })
  
  const gridRowStart = theme('gridRowStart') || {}
  Object.keys(gridRowStart).forEach(key => {
    addClass(`row-start-${key}`)
  })
  
  const gridRowEnd = theme('gridRowEnd') || {}
  Object.keys(gridRowEnd).forEach(key => {
    addClass(`row-end-${key}`)
  })
  
  // EFFECTS & FILTERS
  const opacity = theme('opacity') || {}
  Object.keys(opacity).forEach(key => {
    addClass(`opacity-${key}`)
  })
  
  const boxShadow = theme('boxShadow') || {}
  Object.keys(boxShadow).forEach(key => {
    const suffix = key === 'DEFAULT' ? '' : `-${key}`
    addClass(`shadow${suffix}`)
  })
  
  const dropShadow = theme('dropShadow') || {}
  Object.keys(dropShadow).forEach(key => {
    const suffix = key === 'DEFAULT' ? '' : `-${key}`
    addClass(`drop-shadow${suffix}`)
  })
  
  const blur = theme('blur') || {}
  Object.keys(blur).forEach(key => {
    const suffix = key === 'DEFAULT' ? '' : `-${key}`
    addClass(`blur${suffix}`)
    addClass(`backdrop-blur${suffix}`)
  })
  
  const brightness = theme('brightness') || {}
  Object.keys(brightness).forEach(key => {
    addClass(`brightness-${key}`)
    addClass(`backdrop-brightness-${key}`)
  })
  
  const contrast = theme('contrast') || {}
  Object.keys(contrast).forEach(key => {
    addClass(`contrast-${key}`)
    addClass(`backdrop-contrast-${key}`)
  })
  
  const grayscale = theme('grayscale') || {}
  Object.keys(grayscale).forEach(key => {
    addClass(`grayscale-${key}`)
    addClass(`backdrop-grayscale-${key}`)
  })
  
  const hueRotate = theme('hueRotate') || {}
  Object.keys(hueRotate).forEach(key => {
    addClass(`hue-rotate-${key}`)
    addClass(`backdrop-hue-rotate-${key}`)
  })
  
  const invert = theme('invert') || {}
  Object.keys(invert).forEach(key => {
    addClass(`invert-${key}`)
    addClass(`backdrop-invert-${key}`)
  })
  
  const saturate = theme('saturate') || {}
  Object.keys(saturate).forEach(key => {
    addClass(`saturate-${key}`)
    addClass(`backdrop-saturate-${key}`)
  })
  
  const sepia = theme('sepia') || {}
  Object.keys(sepia).forEach(key => {
    addClass(`sepia-${key}`)
    addClass(`backdrop-sepia-${key}`)
  })
  
  // ANIMATIONS & TRANSITIONS
  const transitionDuration = theme('transitionDuration') || {}
  Object.keys(transitionDuration).forEach(key => {
    addClass(`duration-${key}`)
  })
  
  const transitionDelay = theme('transitionDelay') || {}
  Object.keys(transitionDelay).forEach(key => {
    addClass(`delay-${key}`)
  })
  
  const animation = theme('animation') || {}
  Object.keys(animation).forEach(key => {
    addClass(`animate-${key}`)
  })
  
  // TRANSFORMS
  const scale = theme('scale') || {}
  Object.keys(scale).forEach(key => {
    addClass(`scale-${key}`)
    addClass(`scale-x-${key}`)
    addClass(`scale-y-${key}`)
  })
  
  const rotate = theme('rotate') || {}
  Object.keys(rotate).forEach(key => {
    addClass(`rotate-${key}`)
    if (key !== '0') {
      addClass(`-rotate-${key}`)
    }
  })
  
  const translate = theme('translate') || {}
  Object.keys(translate).forEach(key => {
    addClass(`translate-x-${key}`)
    addClass(`translate-y-${key}`)
    if (key !== '0') {
      addClass(`-translate-x-${key}`)
      addClass(`-translate-y-${key}`)
    }
  })
  
  const skew = theme('skew') || {}
  Object.keys(skew).forEach(key => {
    addClass(`skew-x-${key}`)
    addClass(`skew-y-${key}`)
    if (key !== '0') {
      addClass(`-skew-x-${key}`)
      addClass(`-skew-y-${key}`)
    }
  })
  
  // RESPONSIVE PREFIXES
  Object.keys(screens).forEach(screen => {
    // For each utility class already added, create responsive variants
    const currentClasses = Array.from(safelist)
    currentClasses.forEach(className => {
      addClass(`${screen}:${className}`)
    })
  })
  
  // STATE VARIANTS (hover, focus, etc.)
  const stateVariants = [
    'hover', 'focus', 'focus-within', 'focus-visible', 'active', 'visited',
    'target', 'first', 'last', 'odd', 'even', 'first-of-type', 'last-of-type',
    'only-child', 'only-of-type', 'empty', 'disabled', 'enabled', 'checked',
    'indeterminate', 'default', 'required', 'valid', 'invalid', 'in-range',
    'out-of-range', 'placeholder-shown', 'autofill', 'read-only', 'before',
    'after', 'first-letter', 'first-line', 'marker', 'selection', 'file',
    'backdrop', 'placeholder'
  ]
  
  // Apply state variants to a subset of classes (to avoid explosion)
  const baseClasses = Array.from(safelist).slice(0, 1000) // Limit to prevent memory issues
  stateVariants.forEach(variant => {
    baseClasses.forEach(className => {
      addClass(`${variant}:${className}`)
    })
  })
  
  // DARK MODE VARIANTS
  const darkModeClasses = Array.from(safelist).slice(0, 1000) // Limit for performance
  darkModeClasses.forEach(className => {
    addClass(`dark:${className}`)
  })
  
  // STATIC UTILITY CLASSES (non-theme dependent)
  const staticClasses = [
    // Display
    'block', 'inline-block', 'inline', 'flex', 'inline-flex', 'table', 'inline-table',
    'table-caption', 'table-cell', 'table-column', 'table-column-group', 'table-footer-group',
    'table-header-group', 'table-row-group', 'table-row', 'flow-root', 'grid', 'inline-grid',
    'contents', 'list-item', 'hidden',
    
    // Position
    'static', 'fixed', 'absolute', 'relative', 'sticky',
    
    // Float & Clear
    'float-right', 'float-left', 'float-none', 'clear-left', 'clear-right', 'clear-both', 'clear-none',
    
    // Object Fit & Position
    'object-contain', 'object-cover', 'object-fill', 'object-none', 'object-scale-down',
    'object-bottom', 'object-center', 'object-left', 'object-left-bottom', 'object-left-top',
    'object-right', 'object-right-bottom', 'object-right-top', 'object-top',
    
    // Overflow
    'overflow-auto', 'overflow-hidden', 'overflow-clip', 'overflow-visible', 'overflow-scroll',
    'overflow-x-auto', 'overflow-y-auto', 'overflow-x-hidden', 'overflow-y-hidden',
    'overflow-x-clip', 'overflow-y-clip', 'overflow-x-visible', 'overflow-y-visible',
    'overflow-x-scroll', 'overflow-y-scroll',
    
    // Overscroll
    'overscroll-auto', 'overscroll-contain', 'overscroll-none',
    'overscroll-y-auto', 'overscroll-y-contain', 'overscroll-y-none',
    'overscroll-x-auto', 'overscroll-x-contain', 'overscroll-x-none',
    
    // Visibility & Z-index
    'visible', 'invisible', 'collapse',
    
    // Flexbox
    'flex-1', 'flex-auto', 'flex-initial', 'flex-none',
    'flex-row', 'flex-row-reverse', 'flex-col', 'flex-col-reverse',
    'flex-wrap', 'flex-wrap-reverse', 'flex-nowrap',
    'justify-start', 'justify-end', 'justify-center', 'justify-between', 'justify-around',
    'justify-evenly', 'justify-stretch', 'justify-items-start', 'justify-items-end',
    'justify-items-center', 'justify-items-stretch', 'justify-self-auto', 'justify-self-start',
    'justify-self-end', 'justify-self-center', 'justify-self-stretch',
    'items-start', 'items-end', 'items-center', 'items-baseline', 'items-stretch',
    'content-center', 'content-start', 'content-end', 'content-between', 'content-around', 'content-evenly',
    'self-auto', 'self-start', 'self-end', 'self-center', 'self-stretch', 'self-baseline',
    'place-content-center', 'place-content-start', 'place-content-end', 'place-content-between',
    'place-content-around', 'place-content-evenly', 'place-content-stretch',
    'place-items-start', 'place-items-end', 'place-items-center', 'place-items-stretch',
    'place-self-auto', 'place-self-start', 'place-self-end', 'place-self-center', 'place-self-stretch',
    
    // Text
    'text-left', 'text-center', 'text-right', 'text-justify', 'text-start', 'text-end',
    'align-baseline', 'align-top', 'align-middle', 'align-bottom', 'align-text-top', 'align-text-bottom',
    'align-sub', 'align-super',
    'whitespace-normal', 'whitespace-nowrap', 'whitespace-pre', 'whitespace-pre-line', 'whitespace-pre-wrap',
    'break-normal', 'break-words', 'break-all', 'break-keep',
    'text-ellipsis', 'text-clip',
    'hyphens-none', 'hyphens-manual', 'hyphens-auto',
    'uppercase', 'lowercase', 'capitalize', 'normal-case',
    'italic', 'not-italic',
    'underline', 'overline', 'line-through', 'no-underline',
    'decoration-solid', 'decoration-double', 'decoration-dotted', 'decoration-dashed', 'decoration-wavy',
    'decoration-auto', 'decoration-from-font',
    'underline-offset-auto',
    'indent-0',
    
    // Lists
    'list-none', 'list-disc', 'list-decimal',
    'list-inside', 'list-outside',
    
    // Appearance
    'appearance-none', 'appearance-auto',
    
    // Cursor
    'cursor-auto', 'cursor-default', 'cursor-pointer', 'cursor-wait', 'cursor-text', 'cursor-move',
    'cursor-help', 'cursor-not-allowed', 'cursor-none', 'cursor-context-menu', 'cursor-progress',
    'cursor-cell', 'cursor-crosshair', 'cursor-vertical-text', 'cursor-alias', 'cursor-copy',
    'cursor-no-drop', 'cursor-grab', 'cursor-grabbing', 'cursor-all-scroll', 'cursor-col-resize',
    'cursor-row-resize', 'cursor-n-resize', 'cursor-e-resize', 'cursor-s-resize', 'cursor-w-resize',
    'cursor-ne-resize', 'cursor-nw-resize', 'cursor-se-resize', 'cursor-sw-resize', 'cursor-ew-resize',
    'cursor-ns-resize', 'cursor-nesw-resize', 'cursor-nwse-resize', 'cursor-zoom-in', 'cursor-zoom-out',
    
    // Pointer Events
    'pointer-events-none', 'pointer-events-auto',
    
    // Resize
    'resize-none', 'resize-y', 'resize-x', 'resize',
    
    // User Select
    'select-none', 'select-text', 'select-all', 'select-auto',
    
    // Screen Readers
    'sr-only', 'not-sr-only',
    
    // Mix Blend Mode
    'mix-blend-normal', 'mix-blend-multiply', 'mix-blend-screen', 'mix-blend-overlay',
    'mix-blend-darken', 'mix-blend-lighten', 'mix-blend-color-dodge', 'mix-blend-color-burn',
    'mix-blend-hard-light', 'mix-blend-soft-light', 'mix-blend-difference', 'mix-blend-exclusion',
    'mix-blend-hue', 'mix-blend-saturation', 'mix-blend-color', 'mix-blend-luminosity',
    'mix-blend-plus-lighter',
    
    // Background Blend Mode
    'bg-blend-normal', 'bg-blend-multiply', 'bg-blend-screen', 'bg-blend-overlay',
    'bg-blend-darken', 'bg-blend-lighten', 'bg-blend-color-dodge', 'bg-blend-color-burn',
    'bg-blend-hard-light', 'bg-blend-soft-light', 'bg-blend-difference', 'bg-blend-exclusion',
    'bg-blend-hue', 'bg-blend-saturation', 'bg-blend-color', 'bg-blend-luminosity',
    
    // Isolation
    'isolate', 'isolation-auto',
    
    // Will Change
    'will-change-auto', 'will-change-scroll', 'will-change-contents', 'will-change-transform',
    
    // Contain
    'contain-none', 'contain-content', 'contain-strict',
    
    // Content
    'content-none',
    
    // Forced Color Adjust
    'forced-color-adjust-auto', 'forced-color-adjust-none'
  ]
  
  staticClasses.forEach(className => {
    addClass(className)
  })
  
  // Z-index values
  const zIndex = theme('zIndex') || {}
  Object.keys(zIndex).forEach(key => {
    addClass(`z-${key}`)
  })
  
  // Add custom patterns
  patterns.forEach(pattern => {
    if (typeof pattern === 'string') {
      addClass(pattern)
    }
  })
  
  // Convert Set to sorted array
  return Array.from(safelist).sort()
}

module.exports = plugin.withOptions(({ path = 'safelist.txt', patterns = [] } = {}) => ({ theme }) => {
  const safeList = generator(theme)(patterns).join('\n')
  
  // Check if file exists, if not create it with empty content
  let currentSafeList = ''
  try {
    currentSafeList = fs.readFileSync(path, 'utf8')
  } catch (error) {
    // File doesn't exist, create it
    fs.writeFileSync(path, '')
  }
  
  const hash = crypto.createHash('md5').update(safeList).digest('hex')
  const prevHash = crypto.createHash('md5').update(currentSafeList).digest('hex')
  
  if (hash !== prevHash) {
    const classCount = generator(theme)(patterns).length
    console.log(`Updating safelist with ${classCount.toLocaleString()} classes`)
    fs.writeFileSync(path, safeList)
  }
})