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
    // Prevent infinite recursion for circular references by checking if the object has been visited
    if (obj && typeof obj === 'object') {
      if (visited.has(obj)) {
        return obj; // Return the original object if it's already been visited (circular reference)
      }
      visited.add(obj);

      // Deep clone the object or array to avoid mutating the original object
      const clone = Array.isArray(obj) ? [...obj] : { ...obj };

      // If it's an array, recursively apply deepReplace to each item
      if (Array.isArray(clone)) {
        return clone.map((item) => deepReplace(item, visited)); // Avoid infinite recursion in arrays
      }

      // If it's an object, check for the specific properties and replace
      if (clone?.hasOwnProperty('name') && clone?.hasOwnProperty('set') && clone?.hasOwnProperty('setName')) {
        return (
          <IconRenderer
            icon={
              clone || {
                name: 'FaHouse',
                set: 'Fa6',
                setName: 'Font Awesome 6',
              }
            }
            // color={props?.configuration?.iconColor || 'red'}
            // size={props?.configuration?.iconSize}
          />
        );
      }

      // Otherwise, recursively check all properties of the object
      for (let key in clone) {
        if (clone.hasOwnProperty(key)) {
          // Recursively replace properties
          clone[key] = deepReplace(clone[key], visited); // Recurse on the properties
        }
      }

      return clone; // Return the modified or unmodified clone
    }

    return obj; // Return the original object if not modified
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
        han[key] = (...args) => {
          // Create an event object that combines all parameters
          const eventData = {
            // Dynamically create properties for each argument
            ...args.reduce((acc, arg, index) => {
              // Use generic property names like arg0, arg1, etc.
              acc[`arg${index}`] = arg;
              return acc;
            }, {}),
          };
          // Pass the bundled event data to your handler
          return props?.meta?.config?.createEventHandler(eventData, modifiedItem, props?.meta?.meta?.i);
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
      {err ? (
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