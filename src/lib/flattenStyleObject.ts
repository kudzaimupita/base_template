export const flattenStyleObject = (obj = {}) => {
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

  // Clean up properties to remove unwanted keys
  const { width, height, ...cleanedObj } = obj;

  // Remove the unwanted CSS properties
  delete cleanedObj.WebkitBackgroundClip;
  delete cleanedObj.WebkitTextFillColor;
  delete cleanedObj.backgroundClip;
  // delete cleanedObj.backgroundColor;
  if (cleanedObj?.backgroundType === 'image') {
    delete cleanedObj.backgroundColor;
    delete cleanedObj.background;
  }
  // If backgroundImage is set, ensure it's wrapped in url() if it's a valid URL or base64
  if (cleanedObj?.backgroundImage) {
    const bgImage = cleanedObj.backgroundImage;

    if (bgImage.startsWith('https') || bgImage.startsWith('data:image')) {
      cleanedObj.backgroundImage = `url(${bgImage})`;
    }
  }

  // Default background image if none is set and backgroundType is 'image'
  // if (!cleanedObj?.backgroundImage && cleanedObj.backgroundType === 'image') {
  //   cleanedObj.backgroundImage =
  //     'https://img.freepik.com/premium-vector/transparent-grid-pattern-background-transparency-effect-white-gray-chequered-pattern_1120995-137.jpg?semt=ais_hybrid';
  // }

  return cleanedObj;
};
