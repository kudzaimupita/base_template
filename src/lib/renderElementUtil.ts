import { message } from 'antd';
import { retrieveBody } from './digest/state/utils';
import { Message } from '@mui/icons-material';
import { convertParentViewToLayoutItem, syncParentChildRelationships } from './utils';

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
  setAppStatePartial,
  currentApplication
) => {
  let blueprint = elements.find((el) => el.i === process?.propsMapper?.blueprint);
  let viewElements = [];
  let isViewBlueprint = false;
  let targetView = null;


  // Check if blueprint is a view instead of an element
  if (!blueprint) {
    targetView = currentApplication?.views.find((view) => view.id === process?.propsMapper?.blueprint);

    if (targetView) {
      // message.info('hhghhgh')
      isViewBlueprint = true;
      viewElements = syncParentChildRelationships([...convertParentViewToLayoutItem(targetView, process?.propsMapper?.blueprint)]) || [];


      // Use the first element as the main blueprint or create a container
      blueprint = viewElements[0] || {
        i: process?.propsMapper?.blueprint,
        name: targetView.name || 'View Container',
        type: 'container',
        configuration: {}
      };
    } else {
      console.error('Blueprint not found in elements or views');
      return;
    }
  }

  const targetElement = process?.propsMapper?.targetElement;
  const propsMap = process?.propsMapper.mappings || [];
  const defaults = process?.propsMapper.defaults || {};

  /**
   * Helper function to process property mappings for an element
   */
  const processPropertyMappings = (elementId, newElementId = null,originalId) => {
    const effectiveElementId = newElementId || elementId;
// message.info(originalId)
    propsMap.forEach((mapItem) => {
      if (mapItem?.element === originalId) {
        // message.info('jj')

        dispatch(
          setAppStatePartial({
            key:  effectiveElementId + '.' + mapItem?.field,
            payload: retrieveBody(
              null,
              mapItem?.value,
              process?.event,
              process?.globalObj,
              process?.paramState,
              process?.sessionKey,
              {
                compId: effectiveElementId,
                store: process?.store,
                pageId: tab,
              }
            ),
          })
        );
      }
    });
  };

  /**
   * Helper function to process default values for an element
   */
  const processDefaultValues = (elementId, newElementId = null) => {
    const effectiveElementId = newElementId || elementId;

    Object.keys(defaults).forEach((key) => {
      const defaultItem = defaults[key];
      if (defaultItem?.element === elementId) {
        dispatch(
          setAppStatePartial({
            key:  effectiveElementId + '.' + defaultItem?.targetField,
            payload: retrieveBody(
              null,
              defaultItem?.value,
              process?.event,
              process?.globalObj,
              process?.paramState,
              process?.sessionKey,
              {
                compId: effectiveElementId,
                store: process?.store,
                pageId: tab,
              }
            ),
          })
        );
      }
    });
  };

  /**
   * Helper function to set current item for an element
   */
  const setCurrentItemForElement = (elementId) => {
    if (process?.currentItem && setAppStatePartial) {
      dispatch(
        setAppStatePartial({
          key:  elementId,
          payload: process.currentItem,
        })
      );
    }
  };

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

        let childElements = [];

        if (isViewBlueprint && isParent) {
          // For view blueprints, find direct children of the blueprint maintaining hierarchy
          childElements = viewElements.filter((el) => el.parent === blueprint.i);

        } else if (isViewBlueprint) {
          // For nested view elements, find children within the view elements
          childElements = viewElements.filter((el) => el.parent === originalId);
        } else {
          // Normal case - find children by parent relationship
          childElements = prevElements.filter((el) => el.parent === originalId);

          if (!childElements.length && isParent) {
            // Fallback: look for component view children
            const children = elements.filter((it) => it.isComponentView)?.map((v) => {
              const view = currentApplication?.views?.find((vi) => vi.id === originalId);
         
              return view?.layout;
            }).flat().filter(Boolean);

            childElements = children || [];

          }
        }

        return childElements
          .map((childd) => {
            const child = { ...childd };
            let newChildId = `${newParentId}-child-${child.i}`;

            // Set app state for the child
            setCurrentItemForElement(newChildId);

            // Process default values for this child
            processDefaultValues(child.i, newChildId);


            processPropertyMappings(child.i, newChildId,child.originId
);

            const processedChild = {
              ...child,
              configuration: {
                ...child.configuration,
                ...appState?.[newChildId],
                ...(editMode ? {} : { events: createEventHandlers({ ...child, i: newChildId, test: 'jjj' }, {}) }),
                ...(editMode ? {} : createEventHandlers({ ...child, i: newChildId, test: 'jjj' }, {})),
              },
              parent: newParentId,
              i: newChildId,
              ...(editMode ? {} : { events: createEventHandlers({ ...child, i: newChildId, test: 'jjj' }, {}) }),
              ...(editMode ? {} : createEventHandlers({ ...child, i: newChildId, test: 'jjj' }, {})),
              ...appState?.[newChildId],
            };

            // Recursively process this child's children
            const grandChildren = findAndProcessChildren(child.i, newChildId, false);

            // Update the processed child's children array to include the new IDs
            if (grandChildren.length > 0) {
              processedChild.children = grandChildren
                .filter((grandChild) => grandChild.parent === newChildId)
                .map((grandChild) => grandChild.i);
            }

            return [processedChild, ...grandChildren];
          })
          .flat();
      };

      // Get all nested children with updated IDs and parents
      const allChildren = findAndProcessChildren(
        isViewBlueprint ? blueprint.i : process?.propsMapper?.blueprint,
        newElementId,
        true
      );

      // Add the new element with its children array
      const newElement = {
        ...blueprint,
        parent: targetElement,
        i: newElementId,
        isVirtual: true,
        isViewBlueprint: isViewBlueprint,
        originalBlueprintId: process?.propsMapper?.blueprint,
        children: allChildren.filter((child) => child.parent === newElementId).map((child) => child.i),
      };

      // Set app state for the new element
      setCurrentItemForElement(newElementId);

      // Process default values for the parent
      processDefaultValues(
        isViewBlueprint ? blueprint.i : process?.propsMapper?.blueprint,
        newElementId
      );

      // Process property mappings for the parent element
      processPropertyMappings(
        isViewBlueprint ? blueprint.i : process?.propsMapper?.blueprint,
        newElementId
      );

      // Add the new element and all its children to the updated elements array
      updatedElements.push(newElement, ...allChildren);
      return updatedElements;
    });
  }

  // Handle inject type
  if (process?.propsMapper?.renderType === 'inject') {

    if (isViewBlueprint) {
      // Handle view blueprint injection

      // Process mappings and defaults for the main blueprint element
      processPropertyMappings(blueprint.i);
      processDefaultValues(blueprint.i);
      setCurrentItemForElement(blueprint.i);

      // Process mappings and defaults for all view elements
      viewElements.forEach((viewElement) => {
        if (viewElement.i !== blueprint.i) {
          processPropertyMappings(viewElement.i);
          processDefaultValues(viewElement.i);
          setCurrentItemForElement(viewElement.i);
        }
      });

      // Process any direct mappings that reference the original blueprint ID
      propsMap.forEach((mapItem) => {
        if (mapItem?.element === process?.propsMapper?.blueprint) {
          // If mapping references the view ID directly, apply to the main blueprint element
          dispatch(
            setAppStatePartial({
              key:  blueprint.i + '.' + mapItem?.field,
              payload: retrieveBody(
                null,
                mapItem?.value,
                process?.event,
                process?.globalObj,
                process?.paramState,
                process?.sessionKey,
                {
                  compId: blueprint.i,
                  store: process?.store,
                  pageId: tab,
                }
              ),
            })
          );
        }
      });

      // Process any direct defaults that reference the original blueprint ID
      Object.keys(defaults).forEach((key) => {
        const defaultItem = defaults[key];
        if (defaultItem?.element === process?.propsMapper?.blueprint) {
          dispatch(
            setAppStatePartial({
              key:  blueprint.i + '.' + defaultItem?.targetField,
              payload: retrieveBody(
                null,
                defaultItem?.value,
                process?.event,
                process?.globalObj,
                process?.paramState,
                process?.sessionKey,
                {
                  compId: blueprint.i,
                  store: process?.store,
                  pageId: tab,
                }
              ),
            })
          );
        }
      });

    } else {
      // Handle regular element injection

      // Process property mappings for all mapped elements
      propsMap.forEach((mapItem) => {
        processPropertyMappings(mapItem?.element);
        setCurrentItemForElement(mapItem?.element);
      });

      // Process default values for all elements with defaults
      Object.keys(defaults).forEach((key) => {
        const defaultItem = defaults[key];
        if (defaultItem?.element) {
          processDefaultValues(defaultItem.element);
        }
      });
    }
  }
};

export default renderElementUtil;