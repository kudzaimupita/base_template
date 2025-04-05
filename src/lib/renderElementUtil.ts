import { message } from 'antd';
import { retrieveBody } from './digest/state/utils';

// import { extractValue } from './utils';

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
    const newElementId = `virtual-${process?.currentIndex}`;

    // Skip if element already exists
    if (elements?.find((el) => el.i === newElementId)) {
      return;
    }

    setElementsToRender((prevElements) => {
      // Find the parent element that we're rendering into
      const parentElementIndex = prevElements.findIndex((el) => el.i === targetElement);
      // message.info('newChildId');
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
        // console.log
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
              // console.log(mapItem?.value);
              if (process?.propsMapper?.defaults[key]?.element === childd?.i) {
                dispatch(
                  setAppStatePartial({
                    key: tab + '.' + newChildId + '.' + defaults?.[key]?.targetField,
                    payload: retrieveBody(
                      null,
                      process?.propsMapper?.defaults[key]?.value,
                      process?.event,
                      process?.globalObj,
                      process?.paramState,
                      process?.sessionKey,
                      {
                        compId: newChildId,
                        store: process?.store,
                        pageId: tab,
                      }
                    ),
                  })
                );
              }
            });
            propsMap?.map((mapItem) => {
              if (mapItem?.element === childd?.i) {
                // message.info(newChildId);

                dispatch(
                  setAppStatePartial({
                    key: tab + '.' + newChildId + '.' + mapItem?.field,
                    payload: retrieveBody(
                      null,
                      mapItem?.value,
                      process?.event,
                      process?.globalObj,
                      process?.paramState,
                      process?.sessionKey,
                      {
                        compId: newChildId,
                        pageId: tab,
                        store: process?.store,
                      }
                    ),
                  })
                );
              }
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

      // Add this after creating the newElement
      setAppStatePartial &&
        dispatch(
          setAppStatePartial({
            key: tab + '.' + newElementId,
            payload: process.currentItem,
          })
        );

      // Process default values for the parent
      setAppStatePartial &&
        Object.keys(process?.propsMapper?.defaults || {})?.forEach((key) => {
          if (process?.propsMapper?.blueprint === defaults?.[key]?.element) {
            dispatch(
              setAppStatePartial({
                key: tab + '.' + newElementId + '.' + defaults?.[key]?.targetField,
                payload: retrieveBody(
                  null,
                  defaults?.[key]?.value,
                  process?.event,
                  process?.globalObj,
                  process?.paramState,
                  process?.sessionKey,
                  {
                    compId: newElementId,
                    store: process?.store,
                    pageId: tab,
                  }
                ),
              })
            );
          }
        });

      // Also process mappings for the parent element
      propsMap?.forEach((mapItem) => {
        if (mapItem?.element === process?.propsMapper?.blueprint) {
          dispatch(
            setAppStatePartial({
              key: tab + '.' + newElementId + '.' + mapItem?.field,
              payload: retrieveBody(
                null,
                mapItem?.value,
                process?.event,
                process?.globalObj,
                process?.paramState,
                process?.sessionKey,
                {
                  compId: newElementId,
                  pageId: tab,
                  store: process?.store,
                }
              ),
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
    // message.info('jj');
    const defaultValues = process?.propsMapper?.defaults;

    // Object.keys(defaultValues || {})?.map((key) => {
    //   console.log(defaultValues[key]?.element + '.' + defaultValues?.[key]?.targetField);
    //   dispatch(
    //     setAppStatePartial({
    //       key: tab + '.' + defaultValues[key]?.element + '.' + defaultValues?.[key]?.targetField,
    //       payload: retrieveBody(
    //         null,
    //         defaultValues[key]?.value,
    //         process?.event,
    //         process?.globalObj,
    //         process?.paramState,
    //         process?.sessionKey,
    //         {
    //           compId: defaultValues[key]?.element,
    //           store: process?.store,
    //         }
    //       ),
    //     })
    //   );
    // });

    propsMap?.map((mapItem) => {
      dispatch(
        setAppStatePartial({
          key: tab + '.' + mapItem?.element + '.' + mapItem?.field,
          // payload: mapItem?.value,
          payload: retrieveBody(
            null,
            mapItem?.value,
            process?.event,
            process?.globalObj,
            process?.paramState,
            process?.sessionKey,
            {
              compId: mapItem?.element,
              store: process?.store,
              pageId: tab,
            }
          ),
        })
      );
    });
    setAppStatePartial &&
      propsMap?.map((mapItem) => {
        if (process?.currentItem) {
          dispatch(
            setAppStatePartial({
              key: tab + '.' + mapItem?.element,
              payload: process.currentItem,
            })
          );
        }

        // setAppStatePartial && dispatch();
      });
  }
};

export default renderElementUtil;
