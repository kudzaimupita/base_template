/**
 * Flattens a nested style object and cleans up unwanted properties
 * Also processes transform and transition properties
 * @param {Object} obj - The style object to process
 * @param {string} transform - Optional transform string to apply (e.g. "translate(10px, 20px)")
 * @param {boolean} editMode - If true, sets pointerEvents to "none"
 * @returns {Object} - The cleaned and flattened style object
 */
export const flattenStyleObject = (obj = {}, transform = '', editMode = false) => {
  // Clone the object to avoid mutations to the original
  const cleanedObj = { ...obj };

  // 1. Remove standard unwanted properties
  removeUnwantedProperties(cleanedObj);

  // 2. Handle background type-specific logic
  processBackgroundProperties(cleanedObj);

  // 3. Process background image
  processBackgroundImage(cleanedObj);

  // 4. Process CSS variables (custom properties)
  processCSSVariables(cleanedObj);

  // 5. Process transform and ensure proper transition
  if (transform) {
    processTransform(cleanedObj, transform);
  }

  // 6. Handle pointer events based on edit mode
  // if (editMode) {
  //   cleanedObj.pointerEvents = "none";
  // }
  if (editMode) {
    delete cleanedObj?.transition;
    delete cleanedObj?._keyframes;
  }
  return cleanedObj;
};

/**
 * Remove unwanted CSS properties from the style object
 * @param {Object} obj - The style object to clean
 */
const removeUnwantedProperties = (obj) => {
  const propertiesToRemove = ['width', 'height', 'WebkitBackgroundClip', 'WebkitTextFillColor', 'backgroundClip'];

  propertiesToRemove.forEach((prop) => {
    delete obj[prop];
  });
};

/**
 * Process background properties based on backgroundType
 * @param {Object} obj - The style object to process
 */
const processBackgroundProperties = (obj) => {
  if (obj?.backgroundType === 'image') {
    delete obj.backgroundColor;
    delete obj.background;
  }
};

/**
 * Process CSS variables (custom properties) from cssVariables object
 * @param {Object} obj - The style object to process
 */
const processCSSVariables = (obj) => {
  if (obj.cssVariables && typeof obj.cssVariables === 'object') {
    // Add CSS variables as custom properties to the style object
    Object.entries(obj.cssVariables).forEach(([key, value]) => {
      // Skip internal properties that start with underscore
      if (key.startsWith('_')) {
        return;
      }
      if (key.startsWith('--') && value !== undefined && value !== null && value !== '') {
        obj[key] = value;
      }
    });
    // Remove the cssVariables object as it's been processed
    delete obj.cssVariables;
  }
};

/**
 * Process backgroundImage property
 * @param {Object} obj - The style object to process
 */
const processBackgroundImage = (obj) => {
  if (!obj?.backgroundImage) return;

  // Remove backgroundImage if it's "url(null)"
  if (obj.backgroundImage === 'url(null)') {
    delete obj.backgroundImage;
    return;
  }

  // Ensure URL format for valid URLs and base64 data
  const bgImage = obj.backgroundImage;
  if (
    typeof bgImage === 'string' &&
    (bgImage.startsWith('https') || bgImage.startsWith('data:image')) &&
    !bgImage.startsWith('url(')
  ) {
    obj.backgroundImage = `url(${bgImage})`;
  }
};

/**
 * Process transform property and ensure proper transition
 * @param {Object} obj - The style object to process
 * @param {string} transform - The transform string to apply
 */
const processTransform = (obj, transform) => {
  // Extract any translate values from the provided transform
  const translateMatch = transform.match(/translate\(([^)]*)\)/);
  let translateValue = '';

  if (translateMatch && translateMatch[1]) {
    translateValue = translateMatch[1];
  }

  // Handle existing transform if present
  if (obj.transform) {
    // Check if the existing transform already has a translate
    const existingTranslateMatch = obj.transform.match(/translate\([^)]*\)/);

    if (existingTranslateMatch) {
      // Replace the existing translate with our new one
      obj.transform = obj.transform.replace(/translate\([^)]*\)/, translateMatch ? translateMatch[0] : '');
    } else if (translateMatch) {
      // Append the new translate to the existing transform
      obj.transform = `${obj.transform} ${translateMatch[0]}`;
    }
  } else if (transform) {
    // No existing transform, just use the provided one
    obj.transform = transform;
  }

  // Ensure transition property includes transform transition and translate
  if (translateValue) {
    if (!obj.transition) {
      obj.transition = `transform 0.3s ease translate(${translateValue})`;
    } else if (!obj.transition.includes('transform')) {
      obj.transition = `${obj.transition}, transform 0.3s ease translate(${translateValue})`;
    } else if (!obj.transition.includes('translate')) {
      obj.transition = `${obj.transition} translate(${translateValue})`;
    } else {
      // Replace existing translate in transition
      obj.transition = obj.transition.replace(/translate\([^)]*\)/, `translate(${translateValue})`);
    }
  } else if (!obj.transition) {
    obj.transition = 'transform 0.3s ease';
  }
};

/**
 * Legacy flatten function (not currently used but kept for reference)
 * @param {Object} obj - The object to flatten
 * @returns {Object} - The flattened object
 */
const flattenNestedObject = (obj) => {
  const flattened = {};

  const recurse = (current, prefix = '') => {
    for (const key in current) {
      if (
        Object.prototype.hasOwnProperty.call(current, key) &&
        typeof current[key] === 'object' &&
        current[key] !== null &&
        !Array.isArray(current[key])
      ) {
        recurse(current[key], `${prefix}${key}-`);
      } else {
        flattened[prefix + key] = current[key];
      }
    }
  };

  recurse(obj);
  return flattened;
};
