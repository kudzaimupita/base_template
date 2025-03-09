// import './ReactEditor.css';

import * as AntCharts from '@ant-design/plots';
import * as AntDesign from 'antd';

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// import AntIcon from './IconView';
import { ErrorBoundary } from 'react-error-boundary';
import FormSc from '@rjsf/antd';
import { debounce } from 'lodash';
import defaults from 'json-schema-defaults';
import { processController } from './digest/digester';
import { useSelector } from 'react-redux';

// import { processController } from '../components/Views/digest/digester';
// import validator from '@rjsf/validator-ajv8';

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
  const currentApplication = useSelector((state: any) => state.currentAppState.currentApplication);
  const component = props.allComponentsRaw?.find((item) => item._id === props.meta?.componentId);
  const containerRef = useRef(null);
  const { tab, id, ...params } = useParams();
  const createEventHandler = useCallback(
    (key, processHandler, navigate, id, newParams) =>
      debounce(
        (e) =>
          processController(
            processHandler || [],
            e || {},
            id,
            navigate,
            newParams,
            'eventHandler',
            props.meta.i,
            () => '',
            tab
          ),
        10
      ),
    []
  );
  const [err, setErr] = useState(null);
  const appState = useSelector((state) => state.appState);
  const navigate = useNavigate();
  const generateState = async () => {
    const pageState = {};
    const newParams = {
      ...params,
    };
    const processItems = async (items) => {
      const overrides = props.meta?.configuration?._overrides_ || [];
      await Promise.all(
        overrides.map(async (key) => {
          try {
            await processController(
              key,
              {},
              currentApplication._id,
              navigate,
              newParams,
              'onMount',
              props.meta?.i,
              (process) => '',
              tab
            );
          } catch (error) {
            console.error('Error processing override:', {
              key,
              error,
            });
          }
        })
      );
    };
    await processItems([]);
    return pageState;
  };
  useEffect(() => {
    const fetchData = async () => {
      await generateState();
    };
    if (props.meta?.i) {
      fetchData();
    }
    () => {};
  }, [tab, currentApplication?._id, props.checked, window.location.search]);
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
  const defaultData = useMemo(
    () => ({
      ...defaults(props?.data?.props?.schema || {}),
    }),
    [props?.data?.props?.schema]
  );
  function generateHandlers(obj, navigate, id, newParams, targetKey = 'plugins') {
    const handlers = {};
    function traverse(obj, parentKey) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          if (key === targetKey && Array.isArray(value)) {
            if (parentKey) {
              handlers[parentKey] = createEventHandler(parentKey, value, navigate, id, newParams);
            }
          } else if (typeof value === 'object' && value !== null) {
            traverse(value, key);
          }
        }
      }
    }
    traverse(obj, null);
    return handlers;
  }
  const eventHandlerProps = useMemo(() => {
    const han = {};
    const newParams = {
      ...params,
    };
    const it = Object.keys(props?.props || {})?.map((key) => {
      if (Array.isArray(props.props[key]?.plugins)) {
        han[key] = createEventHandler(key, props.props[key], navigate, id, newParams);
        return props.props[key]?.plugins;
      }
    });
    return han;
  }, [params, props, id, navigate]);
  function findById(obj, targetId) {
    if (obj?.name === targetId) return obj;
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const result = findById(item, targetId);
        if (result) return result;
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        const result = findById(obj[key], targetId);
        if (result) return result;
      }
    }
    return null;
  }
  function updateByIdAndReturnNew(obj, targetId, newData) {
    if (obj && obj.i === targetId) {
      return {
        ...obj,
        ...newData,
      };
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => updateByIdAndReturnNew(item, targetId, newData));
    } else if (typeof obj === 'object' && obj !== null) {
      const updatedObject = {};
      for (const key in obj) {
        updatedObject[key] = updateByIdAndReturnNew(obj[key], targetId, newData);
      }
      return updatedObject;
    }
    return obj;
  }
  const onLayoutChange = (layout) => {
    const newItem = {
      ...findById(props.currentLayout, props.meta.i),
      layout,
    };
    props.onLayoutChange(updateByIdAndReturnNew(props.currentLayout, props.meta.i, newItem));
  };
  const bindings = useMemo(() => {
    return {
      ...defaultData,
      ...props.props,
      ...propsData,
      ...eventHandlerProps,
      children: props.children,
      onNestedLayoutChange: onLayoutChange,
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
    props.editMode,
    props.props,
    props.children,
    JSON.stringify(propsData),
    eventHandlerProps,
    propsData,
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
      className={`text-gray-400 border-red-500 zoomedd6 pointer-efvents-none d ${
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
