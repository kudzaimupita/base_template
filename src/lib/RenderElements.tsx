/* eslint-disable @typescript-eslint/no-unused-vars */

import { Col, Flex, Row, message } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { EVENT_HANDLERS } from './eventHandlersTypes';
import ErrorBoundary from './ErrorBoundary';
import { IconRenderer } from './IconRenderer';
import InlineEditText from './InLineTextEditor';
import VirtualElementWrapper from './VitualElementWrapper';
import { flattenStyleObject } from './flattenStyleObject';
import { generateComponentGroups } from './list';
import { isEmpty } from 'lodash';
import { processController } from './digest/digester';
import renderElementUtil from './renderElementUtil';
import { retrieveBody } from './digest/state/utils';

// import { IconRenderer } from './IconSelector';

// import { refreshAppAuth } from '@/store';

// import { retrieveBody } from '../../components/Views/digest/state/utils';

// import { setAppStatePartial } from '@/store';
export function extractValue(obj, template = '') {
  // Remove {{self. and }} from the template
  const cleanPath = template
    ?.replace(/{{self\./g, '')
    .replace(/}}/g, '')
    .trim();

  // Split the path into parts in case of nested properties
  const parts = cleanPath.split('.');

  // Traverse the object following the path
  let result = obj;
  for (const part of parts) {
    if (result && typeof result === 'object' && part in result) {
      result = result[part];
    } else {
      return undefined; // Return undefined if path is invalid
    }
  }

  return result;
}
const SELF_CLOSING_TAGS = new Set([
  'input',
  'img',
  'br',
  'hr',
  'area',
  'base',
  'col',
  'embed',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

const ElementItem = ({
  item: oldItem,
  // appState,
  allComponentsRaw,
  setAppStatePartial,
  setCommentPos,
  targets,
  readOnly,
  index,
  elements,
  params,
  editMode,
  isDrawingPathActive,
  setIsDrawingPathActive,
  setActiveDrawingPathId,
  activeDrawingPathId,
  setSelectedElements,
  isDragging,
  builderCursorMode,
  flattenStyleObject,
  createEventHandlers,
  renderComponent,
  currentApplication,
  tab,
  navigate,
  AntDesign,
  ReactJson,
  appState,
  dispatch,
  setElementsToRender,
  store: store,
  refreshAppAuth,
  setDestroyInfo,
  setSessionInfo,
  storeInvocation,
  setItemToEdit,
}) => {
  // message.error(JSON.stringify(editMode));
  const item = { ...oldItem };
  const [isHovered, setisHovered] = useState(false);
  // const { tab } = useParams();

  // useEffect(() => {
  //   !readOnly &&
  //     item?.configuration?._interface_?.map((interfaceItem) => {
  //       dispatch(
  //         setAppStatePartial({
  //           key: tab + '.' + interfaceItem?.element + '.' + interfaceItem?.targetField,
  //           payload: interfaceItem?.defaultValue,
  //         })
  //       );
  //     }, []);
  // }, [elements]);

  useEffect(() => {
    const generateState = async () => {
      // if (editMode) return;

      const pageState = {};

      // if (editMode) return;
      const processItems = async () => {
        const overrides = item?.configuration?._overrides_ || [];
        // const mapElementsConfig = item?.configuration?._overrides_?.[0]?.plugins?.find((p) => p.type === 'ui-mapElements');

        await Promise.all(
          overrides.map(async (key) => {
            //

            try {
              if (isEmpty(key)) {
                return;
              }
              await processController(
                key,
                {},
                currentApplication._id,
                navigate,
                params,
                'onMount',
                item?.i,
                (process) => '',

                tab,
                (process) =>
                  renderElementUtil(
                    { ...process, store, allElements: elements },
                    elements,
                    setElementsToRender,
                    appState,
                    dispatch,
                    tab,
                    createEventHandlers,
                    editMode,
                    extractValue,
                    setAppStatePartial
                  ),
                editMode,
                {
                  store: store,
                  refreshAppAuth: refreshAppAuth,
                  setDestroyInfo: setDestroyInfo,
                  setSessionInfo: setSessionInfo,
                  setAppStatePartial: setAppStatePartial,
                  storeInvocation: storeInvocation,
                }
              );
            } catch (error) {
              console.error('Error processing override:', { key, error, item });
            }
          })
        );
      };

      await processItems();
      return pageState;
    };

    if (item?.i) {
      !readOnly && generateState();
    }
    // message.error('jj');
    // console.log('Selected targets: ', activeDrawingPathId);

    return () => {};
  }, [
    // tab,
    currentApplication?._id,
    // item,
    // window.location.search,
    elements,
    // editMode,
    // activeDrawingPathId,
    localStorage.getItem(currentApplication._id + '-' + 'sessionInfo'),
    // localStorage.getItem(currentApplication?._id + '-sessionInfo' || ''),
  ]);

  useEffect(() => {
    if (!readOnly && item.componentId === 'drawpath' && item.i === activeDrawingPathId) {
      setIsDrawingPathActive(true);
    }
  }, [activeDrawingPathId, item.i, item.componentId]);

  useEffect(() => {
    if (!readOnly && !item.componentId === 'drawpath') {
    }
  }, [item.i, activeDrawingPathId, isDrawingPathActive]);

  const renderItemWithData = () => {
    const viewTag = item?.configuration?.tag || 'div';
    item.configuration = {
      ...{
        ...item.configuration,
        backgroundImage: item.componentId === 'text' ? '' : item.configuration?.backgroundImage,
        background: item.componentId === 'text' ? '' : item.configuration?.background,
        ...appState?.[tab]?.[item.i],
      },
      ...appState?.[tab]?.[item.i],
    };
    const processedStyle = {
      // backgroundColor: 'transparent',
      ...item?.style,
      ...flattenStyleObject(item?.configuration, item?.parent, item?.isChild),
      // backgroundColor: 'transparent',

      // Properly handle background image URLs
      ...(item.configuration?.backgroundImage && {
        backgroundImage:
          item.configuration.backgroundImage.startsWith('http') || item.configuration.backgroundImage.startsWith('data:')
            ? `url(${item.configuration.backgroundImage})`
            : item.configuration.backgroundImage,
      }),

      // background: item.configuration?.backgroundImage ? item.configuration?.background : '',
      ...(isHovered &&
        !readOnly &&
        !isDragging &&
        editMode &&
        !targets?.find((target) => target.id === item.i) && { outline: '2px solid #4a90e2', outlineOffset: '2px' }), // Add blue border when hovered
    };

    const handleDoubleClick = (e) => {
      e.stopPropagation();
      if (item.componentId === 'drawpath') {
        if (typeof setActiveDrawingPathId === 'function') {
          setActiveDrawingPathId(item.i);
        }
        if (typeof setIsDrawingPathActive === 'function') {
          setIsDrawingPathActive(!isDrawingPathActive);
        }
        setTimeout(() => {
          if (!isDrawingPathActive) {
            // message.info(activeDrawingPathId);
            setSelectedElements([]);
          } else {
            // message.info(activeDrawingPathId);
          }
        }, 1);
      }
    };

    const baseProps = {
      key: item.i || index,
      id: item.i || index,
      onMouseEnter: () => !readOnly && editMode && setisHovered(true), // Set isHovered to true on mouse enter
      onMouseLeave: () => !readOnly && editMode && setisHovered(false), // Set isHovered to false on mouse leave
      onClick: (e) => {
        e.stopPropagation();
        if (item.componentId === 'drawpath' && isDrawingPathActive) {
          setIsDrawingPathActive(false);
        }

        // setTimeout(() => {
        setCommentPos?.(e);
        // }, 100);
        // message.info(e.clientX);
      },
      onDoubleClick: (e) => {
        e.stopPropagation();
        if (item.componentId === 'drawpath') {
          setActiveDrawingPathId(item.i);
          setIsDrawingPathActive(!isDrawingPathActive);
          setSelectedElements([]);
        }
      },
      style: processedStyle,
      className: `
      ${item.i}
      ${item?.isGroup ? 'group-container ' : ' '}
     
      ${item?.configuration?.classNames} 

     ${
       builderCursorMode === 'hand'
         ? 'cursor-grab active:cursor-grabbing !pointer-events-none'
         : builderCursorMode === 'draw'
         ? '!cursor-draw !pointer-events-none !disabled'
         : builderCursorMode === 'path'
         ? 'cursor-path'
         : builderCursorMode === 'comment'
         ? '!cursor-comment !pointer-events-none'
         : editMode && !isDrawingPathActive && builderCursorMode === 'default'
         ? ' cube active:cursor-grabbing '
         : ' cube active:cursor-grabbing '
     }
  `,
      ...(editMode ? {} : { events: createEventHandlers(item) }),
      ...(editMode ? {} : createEventHandlers(item)),
    };

    const props = {
      ...flattenStyleObject({
        ...baseProps,
        ...{
          // ...item.configuration,
          backgroundImage: item.componentId === 'text' ? '' : item.configuration?.backgroundImage,
          background: item.componentId === 'text' ? '' : item.configuration?.background,
          ...appState?.[tab]?.[item.i],
        },
        ...baseProps.events,
        ...appState?.[tab]?.[item.i],
        // css: baseProps.style,
        // data: itemData,
      }),
    };

    if (editMode) {
      delete props.disabled;
      if (viewTag.toLowerCase() === 'button') {
        props.type = 'button';
      }
    }

    const parent = elements?.find((el) => el.i === item.parent);
    if (parent?.componentId === 'containers-flex' || parent?.componentId === 'containers-grid') {
      delete props.style.position;
      delete props.style.transform;
      if (props.configuration) {
        delete props.configuration.position;
      }
    }

    // if (item.componentId==="text"){
    //   return (
    //     renderComponent(item.componentId, { ...item, data: itemData, baseProps })
    //   )
    // }

    const children = item?.isGroup ? (
      <ElementRenderer
        setAppStatePartial={setAppStatePartial}
        allComponentsRaw={allComponentsRaw}
        isWrapper={false}
        appState={appState}
        setItemToEdit={setItemToEdit}
        elements={elements}
        parentId={item.i}
        editMode={editMode}
        dispatch={dispatch}
        isDrawingPathActive={isDrawingPathActive}
        setIsDrawingPathActive={setIsDrawingPathActive}
        setActiveDrawingPathId={setActiveDrawingPathId}
        setSelectedElements={setSelectedElements}
        isDragging={isDragging}
        // flattenStyleObject={flattenStyleObject}
        // createEventHandlers={createEventHandlers}
        // renderComponent={renderComponent}
        currentApplication={currentApplication}
        tab={tab}
        // allComponents={allComponents}
        navigate={navigate}
        AntDesign={AntDesign}
        ReactJson={ReactJson}
        builderCursorMode={builderCursorMode}
        store={store}
        refreshAppAuth={refreshAppAuth}
        setDestroyInfo={setDestroyInfo}
        setSessionInfo={setSessionInfo}
        storeInvocation={storeInvocation}
      />
    ) : (
      renderComponent(item.componentId, {
        ...item,
        // data: itemData,
        isDrawingPathActive: item.i === activeDrawingPathId && isDrawingPathActive,
        setIsDrawingPathActive,
        activeDrawingPathId,
        setActiveDrawingPathId,
        allComponentsRaw,
      })
    );

    if (SELF_CLOSING_TAGS.has(viewTag.toLowerCase())) {
      const content = React.createElement(viewTag, props);

      return item?.isVirtual ? (
        <VirtualElementWrapper editMode={editMode} style={processedStyle}>
          {content}
        </VirtualElementWrapper>
      ) : (
        content
      );
    }

    const content =
      item?.componentId === 'containers-grid' ? (
        <div {...props}>
          <Row
            justify={item?.configuration?.justify}
            align={item?.configuration?.align}
            wrap={item?.configuration?.wrap}
            gutter={item?.configuration?.gutter}
          >
            {React.Children.map(children, (child) => {
              if (!React.isValidElement(child)) return null;
              const childConfig = child.props?.configuration || {};
              return <Col {...childConfig}>{child}</Col>;
            })}
          </Row>
        </div>
      ) : item?.componentId === 'containers-flex' ? (
        <div {...props}>
          <Flex
            justify={item?.configuration?.justify || 'normal'}
            gap={item?.configuration?.gap || 0}
            align={item?.configuration?.align || 'center'}
            vertical={item?.configuration?.vertical}
            style={{ width: '100%', height: '100%' }}
            wrap={item?.configuration?.wrap || 'nowrap'}
          >
            {children}
          </Flex>
        </div>
      ) : (
        React.createElement(viewTag, props, children)
      );

    return item?.isVirtual ? (
      <VirtualElementWrapper editMode={editMode} style={processedStyle}>
        {content}
      </VirtualElementWrapper>
    ) : (
      content
    );
  };

  // If in edit mode or no dataSource, render single element
  return renderItemWithData();
};

const ElementRenderer = ({
  isWrapper = true,
  setItemToEdit,
  setCommentPos,
  elements,
  parentId,
  editMode,
  isDrawingPathActive,
  setIsDrawingPathActive,
  activeDrawingPathId,
  setActiveDrawingPathId,
  setSelectedElements,
  isDragging,
  // flattenStyleObject,
  // createEventHandlers,
  // renderComponent,
  currentApplication,
  parentStyle,
  setAppStatePartial,
  // tab,
  navigate,
  AntDesign,
  appState,
  dispatch,
  ReactJson,
  // appState,
  propsData,
  targets,
  readOnly,
  params,
  builderCursorMode,
  store: store,
  refreshAppAuth,
  setDestroyInfo,
  setSessionInfo,
  storeInvocation,
  allComponentsRaw = [],
  tab,
}) => {
  const [elementsToRender, setElementsToRender] = useState(elements);

  const createEventHandler = (e, processToRun, elementId) => {
    // message.success(elementId);
    // console.log

    return processController(
      processToRun || [],
      e || {},
      currentApplication?._id,
      navigate,
      params,
      'eventHandler',
      elementId,
      (process) => ',',

      tab,
      () => '',
      editMode,
      {
        store: store,
        refreshAppAuth: refreshAppAuth,
        setDestroyInfo: setDestroyInfo,
        setSessionInfo: setSessionInfo,
        setAppStatePartial: setAppStatePartial,
        storeInvocation: storeInvocation,
      }
    );
  };
  const createEventHandlers = (item, renderElementUtil) => {
    // console.log(data, item);
    // message.warning(item.i);
    // message.warning('jjjjjjjjjjj');
    const handlers = {};

    Object.keys(EVENT_HANDLERS).forEach((eventName) => {
      // console.log(item?.configuration?.[eventName], item);
      if (!item?.configuration?.[eventName] || item?.configuration?.[eventName]?.plugins?.length === 0) return;
      const configHandler = item?.configuration?.[eventName];

      if (!isEmpty(configHandler)) {
        handlers[eventName] = (e) => {
          // if (item?.configuration?.[eventName]?.preventDefault()) {
          //   e.preventDefault();
          // }
          // if (item?.configuration?.[eventName]?.stopPropagation()) {
          //   e.stopPropagation();
          // }
          if (eventName === 'onSubmit') {
            e.preventDefault();
          }
          if (!isEmpty(configHandler?.plugins)) {
            handlers[eventName] = (e) => {
              // e.preventDefault();

              // return {};
              return createEventHandler(e, configHandler, item.i);
            };
          }
          return createEventHandler(e, configHandler, item.i);
        };
      }
    });
    return handlers;
  };
  useEffect(() => {
    if (JSON.stringify(elements) !== JSON.stringify(elementsToRender) && !readOnly) {
      setElementsToRender(elements);
    }
  }, [elements]);
  // const dispatch = useDispatch();
  useEffect(() => {
    const generateState = async () => {
      if (readOnly || !currentApplication) return {};

      const processItems = async () => {
        const overrides = currentApplication?.views?.find((view) => view?.id === tab)?.configuration?._overrides_ || [];

        await Promise.all(
          overrides.map(async (key) => {
            try {
              // return;
              await processController(
                key,
                {},
                currentApplication._id,
                navigate,
                params,
                'onMount',
                '',
                () => '',
                tab,
                (process) =>
                  renderElementUtil(
                    { ...process, store },
                    elements,
                    setElementsToRender,
                    appState,
                    dispatch,
                    tab,
                    createEventHandlers,
                    editMode,
                    extractValue,
                    setAppStatePartial
                  ),
                editMode,
                {
                  store: store,
                  refreshAppAuth: refreshAppAuth,
                  setDestroyInfo: setDestroyInfo,
                  setSessionInfo: setSessionInfo,
                  setAppStatePartial: setAppStatePartial,
                  storeInvocation: storeInvocation,
                }
              );
            } catch (error) {
              console.error('Error processing override:', { key, error });
            }
          })
        );
      };

      await processItems();
      return {};
    };

    !readOnly && isWrapper && generateState();

    return () => {};
  }, [
    tab,
    currentApplication,
    window.location.search,
    // elements,
    // editMode,
    // activeDrawingPathId,
    navigate,
    params,
    // renderElementUtil,
    readOnly,

    localStorage.getItem(currentApplication?._id + '-' + 'sessionInfo'),
  ]);

  const uniqueElements = useMemo(() => {
    return Array.from(new Map(elementsToRender.map((item) => [item.i, item])).values());
  }, [elementsToRender]);
  const [allComponents, setallComponents] = useState([]);
  const processedComponents = useMemo(
    () => allComponentsRaw?.map((item) => generateComponentGroups(item)) || [],
    [allComponentsRaw]
  );
  const componentsMap = useMemo(() => {
    return allComponents?.reduce((map, component) => {
      if (component?.value) {
        map[component.value] = component.config?.component;
      }
      return map;
    }, {});
  }, [allComponentsRaw, allComponents]);

  useEffect(() => {
    // dispatch(setCurrentApp({}));
    setallComponents(processedComponents);
    // fetchApp2();

    () => {
      // dispatch(setCurrentApp({}));
    };
  }, [elements]);
  const renderComponent = useCallback(
    (id, props) => {
      // return <>Needs some love</>;
      if (props.componentId === 'text') {
        return (
          <InlineEditText
            // lineType="inline"
            overflowEffect="elipsis"
            // scale={scale}
            isEditable={editMode}
            // parentRef={containerRef}
            // isCurrentTarget={itemToEdit.i === props.i}
            targeted={true}
            onType={(e) => {
              setElementsToRender((prev) => {
                return prev.map((el) => {
                  if (el.i === props.i) {
                    const updatedConfig = {
                      ...el.configuration,
                    };
                    updatedConfig.text = e.target?.value;
                    return {
                      ...el,
                      configuration: updatedConfig,
                    };
                  }
                  return el;
                });
              });
              setItemToEdit((prev) => {
                return prev.map((el) => {
                  if (el.i === props.i) {
                    const updatedConfig = {
                      ...el.configuration,
                    };
                    updatedConfig.text = e.target?.value;
                    return {
                      ...el,
                      configuration: updatedConfig,
                    };
                  }
                  return el;
                });
              });
            }}
            overRideStyles={{
              ...props?.configuration,
            }}
            initialText={props?.configuration?.text}
          />
        );
      }
      if (props.componentId === 'icon') {
        return (
          <div className="pointer-events-none">
            <IconRenderer
              icon={
                props?.configuration?.icon || {
                  name: 'FaHouse',
                  set: 'Fa6',
                  setName: 'Font Awesome 6',
                }
              }
              color={props?.configuration?.iconColor || 'red'}
              size={props?.configuration?.iconSize}
            />
          </div>
        );
      }

      // if (props.componentId === 'divider') {
      //   return <DividerComponent configuration={props?.configuration} i={id} />;
      // }
      if (props.componentId === 'drawpath') {
        return (
          // <DrawPathComponent
          //   configuration={{
          //     ...props.configuration,
          //     isSelected: true,
          //     showControls: selectedPath?.i === props.i && showControls,
          //   }}
          //   isEditing={props.i === activeDrawingPathId}
          //   setActiveDrawingPathId={setActiveDrawingPathId}
          //   activeDrawingPathId={activeDrawingPathId}
          //   isDrawingPathActive={isDrawingPathActive}
          //   onPathClick={(e) => {
          //     e.stopPropagation();
          //     setSelectedPath(props);
          //     setShowControls(false);
          //   }}
          //   onPathDoubleClick={(e) => {
          //     e.stopPropagation();
          //     setSelectedPath(props);
          //     setShowControls(true);
          //   }}
          //   onHandleDrag={(pointIndex, handleType, handle) => {
          //     setDraggingHandle({ pathId: props.i, pointIndex, handleType, handle });
          //   }}
          //   onPathUpdate={(newPath) => {
          //     setElements((prev) =>
          //       prev.map((el) => {
          //         if (el.i === props.i) {
          //           return {
          //             ...el,
          //             configuration: {
          //               ...el.configuration,
          //               d: newPath,
          //             },
          //           };
          //         }
          //         return el;
          //       })
          //     );
          //   }}
          // />
          <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
            <path
              d={newPath}
              fill="none"
              stroke="#000"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        );
      }
      const Component = componentsMap?.[id];

      if (props.componentId === 'canvas') {
        return <></>;
      }
      if (!Component) {
        return 'Nothing set';
      }
      const RenderedComponent = Component({
        title: props.title,
        editMode: editMode,
        item: {
          meta: props,
          config: {
            allComponents,
            allComponentsRaw,
            tab,
            store,
            createEventHandler,
            createEventHandlers,
            id,
          },
        },
        configuration: props.configuration,
        ...props,
      });
      // return <></>;
      return RenderedComponent?.type
        ? React.createElement(RenderedComponent.type, {
            ...RenderedComponent.props,
          })
        : '';
    },
    [editMode, isDrawingPathActive, componentsMap]
  );
  const filteredElements = useMemo(() => {
    // message.info('j');
    return uniqueElements
      .filter((item) => item.parent === parentId && item.i)
      .map((item, index) => (
        <ErrorBoundary key={item?.i} fallback={<p>You can provide a custom fallback component here</p>}>
          <ElementItem
            setItemToEdit={setItemToEdit}
            store={store}
            refreshAppAuth={refreshAppAuth}
            setDestroyInfo={setDestroyInfo}
            setSessionInfo={setSessionInfo}
            storeInvocation={storeInvocation}
            appState={appState}
            dispatch={dispatch}
            key={item.i}
            setAppStatePartial={setAppStatePartial}
            isDragging={isDragging}
            allComponentsRaw={allComponentsRaw}
            targets={targets}
            // appState={appState}
            allComponents={allComponents}
            setElementsToRender={setElementsToRender}
            item={item}
            index={index}
            elements={elementsToRender}
            editMode={editMode}
            isDrawingPathActive={isDrawingPathActive}
            setIsDrawingPathActive={setIsDrawingPathActive}
            setActiveDrawingPathId={setActiveDrawingPathId}
            activeDrawingPathId={activeDrawingPathId}
            createEventHandlers={createEventHandlers}
            renderComponent={renderComponent}
            currentApplication={currentApplication}
            tab={tab}
            navigate={navigate}
            AntDesign={AntDesign}
            ReactJson={ReactJson}
            builderCursorMode={builderCursorMode}
            readOnly={readOnly}
            // editM
            setCommentPos={setCommentPos}
            setSelectedElements={setSelectedElements}
            // isDragging={isDragging}
            flattenStyleObject={flattenStyleObject}
          />
        </ErrorBoundary>
      ));
  }, [
    uniqueElements,
    parentId,
    isDragging,
    editMode,
    isDrawingPathActive,
    setActiveDrawingPathId,
    setIsDrawingPathActive,
    activeDrawingPathId,
    setSelectedElements,
    elementsToRender,
    flattenStyleObject,
    createEventHandlers,
    renderComponent,
    currentApplication,
    tab,
    navigate,
    AntDesign,
    ReactJson,
  ]);

  return (
    <>
      {isWrapper ? (
        <div
          style={{
            width:
              currentApplication?.views?.find((view) => view.id === tab)?.configuration?.deviceScreen?.size?.width + 'px' ||
              '1600px',
            height:
              currentApplication?.views?.find((view) => view.id === tab)?.configuration?.deviceScreen?.size?.height + 'px' ||
              '900px',
            // aspectRatio: 16 / 9,
            // maxHeight: '100%',
            // maxWidth: '100%', // Ensure it doesn't overflow
            // margin: '0 auto', // Center the container
            // overflowX: 'hidden',
            position: 'relative',
            overflow: 'visible',
            // backgroundColor: '#fff',
            boxShadow: 'rgba(0, 0, 0, 0.4) 0px 4px 8px, rgba(255, 255, 255, 0.1) 0px 1px 0px inset',
            ...parentStyle,
            ...propsData,
          }}
        >
          {/* {filteredElements?.length} */}
          {filteredElements}
        </div>
      ) : (
        filteredElements
      )}
    </>
  );
};

export default React.memo(ElementRenderer);
