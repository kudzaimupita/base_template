/* eslint-disable no-prototype-builtins */
// import './ReactEditor.css';

import * as AntCharts from '@ant-design/plots';
import * as AntDesign from 'antd';
import * as MUI from '@mui/material';
import * as MuiIcons from '@mui/icons-material';

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ErrorBoundary } from 'react-error-boundary';
import FormSc from '@rjsf/antd';
import { IconRenderer } from './IconRenderer';
import defaults from 'json-schema-defaults';
import { genericEventHandlers } from './eventHandlers';
import { useSelector } from 'react-redux';

// import { useMemo } from 'react';

const JsxParser = React.lazy(() => import('react-jsx-parser'));
const fallbackRender = ({ error }) => (
  <div role="alert">
    <p>Something went wrong with the JSX parsing:</p>
    <pre
      style={{
        color: 'red',
      }}
    >
      {error.message}
    </pre>
  </div>
);
('tets');

const MyComponent = (props) => {
  const component = props?.meta?.config?.allComponentsRaw?.find((item) => item._id === props.meta?.componentId);
  const containerRef = useRef(null);
  // const { tab, id } = props?.meta?.config;
  const tab = props?.meta?.config?.id;
  const id = props?.meta?.config?.id;
  const [err, setErr] = useState(null);
  const appState = useSelector((state) => state.appState);
  const navigate = useNavigate();

  const propsData = appState?.[tab]?.[props?.meta?.i] || {};
  const AntComponents = useMemo(
    () => ({
      ...Object.entries(AntDesign).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [`Ant${key}`]: value,
        }),
        {}
      ),
    }),
    []
  );
  const AntDCharts = useMemo(
    () =>
      Object.entries(AntCharts).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [`AntChart${key}`]: value,
        }),
        {}
      ),
    []
  );

  // Add MUI components with Mui prefix
  const MuiComponents = useMemo(
    () => ({
      ...Object.entries(MUI).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [`Mui${key}`]: value,
        }),
        {}
      ),
    }),
    []
  );

  // Add MUI Icons with MuiIcon prefix
  // const MuiIconComponents = useMemo(
  //   () => ({
  //     ...Object.entries(MuiIcons).reduce(
  //       (acc, [key, value]) => ({
  //         ...acc,
  //         [`MuiIcon${key}`]: value,
  //       }),
  //       {}
  //     ),
  //   }),
  //   []
  // );

  const defaultData = useMemo(
    () => ({
      ...defaults(props?.data?.props?.schema || {}),
    }),
    [props?.data?.props?.schema]
  );

  function deepReplace(obj, visited = new Set()) {
    // Base case: null, undefined, or primitive types
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    // Prevent infinite recursion for circular references
    if (visited.has(obj)) {
      return obj;
    }
    visited.add(obj);

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map((item) => deepReplace(item, new Set(visited)));
    }

    // Check if this is an icon object that needs to be replaced with IconRenderer
    if (obj?.hasOwnProperty('name') && obj?.hasOwnProperty('set') && obj?.hasOwnProperty('setName')) {
      // Return the React element directly, not the object
      return React.createElement(IconRenderer, {
        icon: obj,
        // Include any other props you want to pass to IconRenderer
        // color: props?.configuration?.iconColor || 'red',
        // size: props?.configuration?.iconSize,
      });
    }

    // For other objects, clone and process each property
    const clone = { ...obj };
    for (let key in clone) {
      if (clone.hasOwnProperty(key)) {
        clone[key] = deepReplace(clone[key], new Set(visited));
      }
    }

    return clone;
  }

  const eventHandlerProps = useMemo(() => {
    const han = {};

    Object.keys(props?.props || {})?.forEach((key) => {
      console.log(props);
      const item = props.props[key];

      // Replace nested objects with the required properties
      const modifiedItem = deepReplace(item);

      // Check if the item has the properties we are looking for
      const hasProperties =
        modifiedItem?.hasOwnProperty('name') &&
        modifiedItem?.hasOwnProperty('set') &&
        modifiedItem?.hasOwnProperty('setName');

      // Check for plugins array and recursively process them
      if (Array.isArray(modifiedItem?.plugins)) {
        // Recursively apply deepReplace to each plugin in the plugins array
        modifiedItem.plugins = modifiedItem.plugins.map((plugin) => {
          // If the plugin itself is an object with specific properties, replace it
          return deepReplace(plugin);
        });

        // Create event handler as usual
        han[key] = (e) => {
          return props?.meta?.config?.createEventHandler(e, modifiedItem, props?.meta?.meta?.i);
        };

        return modifiedItem.plugins; // Return the modified plugins
      }

      // Optionally store the modified item if needed
      han[key] = modifiedItem;
    });

    return han;
  }, [props, id, navigate]);

  const bindings = useMemo(() => {
    // Create a set of all the event handler property names for quick lookup
    const eventHandlerPropNames = new Set(Object.keys(genericEventHandlers?.properties));

    // Filter out event handlers from props.props if needed
    const filteredProps = {};
    for (const key in props.props) {
      if (!eventHandlerPropNames.has(key)) {
        filteredProps[key] = props.props[key];
      }
    }

    return {
      ...defaultData,
      ...filteredProps, // Using filtered props instead of props.props
      ...propsData,
      ...eventHandlerProps, // You might want to handle this separately
      children: props.children,
      // onNestedLayoutChange: onLayoutChange,
      currentLayout: props?.meta?.layout,
      _parentId_: props?.meta?.i,
      _setItemToEdit_: props.setItemToEdit,
      _allComponentsRaw_: props.allComponentsRaw,
      _currentItem_: props.currentItem,
      _renderComponent_: props.renderComponent,
      _checked_: props.checked,
      _width_: props.width,
      _breakpoint_: props.breakpoint,
      _gridLayout_: props.gridLayout,
      _allComponents_: props.allComponents,
      // validator,
    };
  }, [
    defaultData,
    // props.editMode,
    props.props,
    props.children,
    JSON.stringify(propsData),
    // eventHandlerProps,
    // propsData,
    eventHandlerProps,
  ]);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.pointerEvents = props.editMode ? 'none' : 'auto';
    }
  }, [props.editMode]);
  return (
    <div
      ref={containerRef}
      className={`text-gray-400 border-red-500 zoomedd6 pointer-efvents-none w-full h-full d ${
        props.editMode ? 'pointedr-events-none' : ''
      }`}
    >
      {false ? (
        <div className="text-red-500">{JSON.stringify(err)}</div>
      ) : (
        <ErrorBoundary fallbackRender={fallbackRender}>
          <Suspense
            fallback={
              <div>
                <AntDesign.Skeleton />
              </div>
            }
          >
            <JsxParser
              className={'w-full  ' + component?.isContainer && ' h-full'}
              renderError={setErr}
              jsx={props.jsx}
              components={{
                ...AntComponents,
                ...AntDCharts,
                ...MuiComponents,
                // ...MuiIconComponents,
                // Grid/Container,
                AntSchemaForm: FormSc,
                // AntIcon,
              }}
              blacklistedAttrs={[]}
              bindings={bindings}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
};
export default MyComponent;
