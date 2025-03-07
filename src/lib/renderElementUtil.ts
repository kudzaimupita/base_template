// import { extractValue } from './utils';

import { retrieveBody } from './digest/state/utils';

// import { retrieveBody } from './digest/state/utils';

// import { retrieveBody } from '../../components/Views/digest/state/utils';

/**
 * Utility function for rendering dynamic elements
 *
 * @param {Object} process - The process containing render configuration
 * @param {Array} elements - Current elements array
 * @param {Function} setElementsToRender - State setter for elements
 * @param {Object} appState - Current application state
 * @param {Function} dispatch - Redux dispatch function
 * @param {String} tab - Current tab identifier
 * @returns {void}
 */
const renderElementUtil = (
  process,
  elements,
  setElementsToRender,
  appState,
  dispatch,
  tab,
  createEventHandlers,
  editMode,
  extractValue,
  setAppStatePartial
) => {
  const blueprint = elements.find((el) => el.i === process?.propsMapper?.blueprint);
  const targetElement = process?.propsMapper?.targetElement;
  const propsMap = process?.propsMapper.mappings;
  const defaults = process?.propsMapper.defaults;

  // Handle renderInto type
  if (process?.propsMapper?.renderType === 'renderInto') {
    const newElementId = `${targetElement}-${process?.propsMapper.blueprint}-virtual-${process?.currentIndex}`;

    // Skip if element already exists
    if (elements?.find((el) => el.i === newElementId)) {
      return;
    }

    setElementsToRender((prevElements) => {
      // Find the parent element that we're rendering into
      const parentElementIndex = prevElements.findIndex((el) => el.i === targetElement);

      if (parentElementIndex === -1) {
        console.error('Parent element not found');
        return prevElements;
      }

      // Create a copy of the previous elements array
      const updatedElements = [...prevElements];

      // Update parent's children array
      const parentElement = updatedElements[parentElementIndex];
      const updatedParent = {
        ...parentElement,
        children: parentElement.children ? [...parentElement.children, newElementId] : [newElementId],
      };
      updatedElements[parentElementIndex] = updatedParent;

      // Find all children of blueprint and create new IDs for them
      const findAndProcessChildren = (originalId, newParentId, isParent) => {
        if (!setAppStatePartial) {
          return [];
        }
        const childElements = prevElements.filter((el) => el.parent === originalId);
        return childElements
          .map((childd) => {
            const child = { ...childd };
            let newChildId = `${newParentId}-child-${child.i}`;

            dispatch(
              setAppStatePartial({
                key: tab + '.' + newChildId,
                payload: process.currentItem,
              })
            );

            Object.keys(process?.propsMapper?.defaults || {})?.map((key) => {
              dispatch(
                setAppStatePartial({
                  key: tab + '.' + newChildId + '.' + defaults?.[key]?.targetField,
                  payload: retrieveBody(null, defaults?.[key]?.value, {}, {}, {}, 'key', { compId: newChildId }),
                })
              );
            });

            const processedChild = {
              ...child,
              configuration: {
                ...child.configuration,
                ...appState?.[tab]?.[newChildId],
                ...(editMode ? {} : { events: createEventHandlers({ ...child, i: newChildId, test: 'jjj' }, {}) }),
                ...(editMode ? {} : createEventHandlers({ ...child, i: newChildId, test: 'jjj' }, {})),
              },
              parent: newParentId,
              i: newChildId,
              ...(editMode ? {} : { events: createEventHandlers({ ...child, i: newChildId, test: 'jjj' }, {}) }),
              ...(editMode ? {} : createEventHandlers({ ...child, i: newChildId, test: 'jjj' }, {})),
              ...appState?.[tab]?.[newChildId],
            };

            // Recursively process this child's children
            const grandChildren = findAndProcessChildren(child.i, newChildId, false);
            return [processedChild, ...grandChildren];
          })
          .flat();
      };

      // Get all nested children with updated IDs and parents
      const allChildren = findAndProcessChildren(process?.propsMapper?.blueprint, newElementId, true);

      // Add the new element with its children array
      const newElement = {
        ...blueprint,
        parent: targetElement,
        i: newElementId,
        isVirtual: true,
        children: allChildren.filter((child) => child.parent === newElementId).map((child) => child.i),
      };

      setAppStatePartial &&
        dispatch(
          setAppStatePartial({
            key: tab + '.' + newElementId,
            payload: process.currentItem,
          })
        );

      setAppStatePartial &&
        Object.keys(process?.propsMapper?.defaults || {})?.map((key) => {
          if (process?.propsMapper?.blueprint === defaults?.[key]?.element) {
            dispatch(
              setAppStatePartial({
                key: tab + '.' + newElementId + '.' + defaults?.[key]?.targetField,
                payload: retrieveBody(null, defaults?.[key]?.value, {}, {}, {}, 'key', { compId: newElementId }),
              })
            );
          }
        });

      // Add the new element and all its children to the updated elements array
      updatedElements.push(newElement, ...allChildren);
      return updatedElements;
    });
  }

  // Handle inject type
  if (process?.propsMapper?.renderType === 'inject') {
    const defaultValues = process?.propsMapper?.defaults;

    setAppStatePartial &&
      Object.keys(process?.propsMapper?.defaults || {})?.map((key) => {
        dispatch(
          setAppStatePartial({
            key: tab + '.' + defaultValues?.[key]?.element + '.' + defaultValues?.[key]?.targetField,
            payload:
              extractValue(appState?.[tab]?.[defaultValues?.[key]?.element], defaultValues?.[key]?.value) ||
              defaultValues?.[key]?.value,
          })
        );
      });

    setAppStatePartial &&
      propsMap?.map((mapItem) => {
        if (mapItem?.injectData) {
          dispatch(
            setAppStatePartial({
              key: tab + '.' + mapItem?.element,
              payload: process.currentItem,
            })
          );
        }

        setAppStatePartial &&
          dispatch(
            setAppStatePartial({
              key: tab + '.' + mapItem?.element + '.' + mapItem?.field,
              payload: extractValue(appState?.[tab]?.[mapItem?.element], mapItem?.value) || mapItem?.value,
            })
          );
      });
  }
};

export default renderElementUtil;
