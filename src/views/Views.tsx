import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import store, { setDestroyInfo, setSessionInfo } from '@/store';
import { useDispatch, useSelector } from 'react-redux';

import ElementRenderer from '../lib/RenderElements';
import appConfig from '../../appConfig.json';
import components from '../../components.json';
import { setAppStatePartial } from '@/store/slices/appState';
import { storeInvocation } from '@/services/invocationService';

// const appConfig = JSON.parse(import.meta.env.VITE_APP_CONFIG || '{}');
const ScaleContainer = ({
  designWidth = 1440,
  designHeight = 900,
  children,
  className = '',
  maxScale = 5,
  style,
  minScale = 0.3,
}) => {
  // Use useCallback for the scale calculation function
  const calculateDimensions = useCallback(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Always use the width scale as the primary scale factor
    // This ensures width always fills the screen
    let newScale = viewportWidth / designWidth;

    // Apply min/max constraints
    newScale = Math.min(Math.max(newScale, minScale), maxScale);

    const scaledWidth = designWidth * newScale;
    const scaledHeight = designHeight * newScale;

    // Center vertically
    const x = 0; // No horizontal centering since we want to fill width
    const y = Math.max(0, (viewportHeight - scaledHeight) / 2);

    return { scale: newScale, position: { x, y } };
  }, [designWidth, designHeight, maxScale, minScale]);

  // Use useMemo for the initial calculation
  const initialDimensions = useMemo(() => calculateDimensions(), [calculateDimensions]);

  // Move state initialization to use memoized values
  const [scale, setScale] = useState(initialDimensions.scale);
  const [position, setPosition] = useState(initialDimensions.position);

  useEffect(() => {
    const updateDimensions = () => {
      const newDimensions = calculateDimensions();
      setScale(newDimensions.scale);
      setPosition(newDimensions.position);
    };

    // Initial calculation to ensure correct starting position
    updateDimensions();

    // Add resize listener for future changes
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [calculateDimensions]);

  // Memoize the style object to prevent unnecessary recalculations
  const containerStyle = useMemo(
    () => ({
      ...style,
      width: `${designWidth}px`,
      height: `${designHeight}px`,
      transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
      transformOrigin: '0 0',
    }),
    [style, designWidth, designHeight, position.x, position.y, scale]
  );

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className={`absolute ${className}`} style={containerStyle}>
        {children}
      </div>
    </div>
  );
};

const Views = () => {
  // const navigate = useNavigate();
  useEffect(() => {
    // Set document title from config
    if (appConfig?.title || appConfig.name) {
      document.title = appConfig?.title || appConfig.name;
    }

    // Set favicon from base64 config
    if (appConfig.icon) {
      const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
      link.type = 'image/png';
      link.rel = 'icon';
      link.href = appConfig?.icon || '';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, []);
  const getDefaultPage = (appConfig) => {
    // Guard clause for missing appConfig
    if (!appConfig?.views?.length) {
      return {};
    }

    const defaultPageId = appConfig?.layoutSettings?.defaultPrivatePage;

    // If defaultPrivatePage is set, try to find that view
    if (defaultPageId) {
      const specifiedPage = appConfig.views.find((view) => view.id === defaultPageId);
      // Return found page or fallback to first view
      return specifiedPage || appConfig.views[0];
    }

    // If no defaultPrivatePage is set, use first view
    return appConfig.views[0];
  };
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();
  const defaultPage = getDefaultPage(appConfig);
  const appState = useSelector((state) => state.appState);
  return (
    <Suspense fallback={<div className="flex flex-auto flex-col h-[100vh]">{/* <ModernSpinner /> */}</div>}>
      <Routes>
        {appConfig.views?.map((route) => {
          const propsData = appState?.[route?.id] || {};
          // const routeParams = (route?.params?.length ?? 0) > 0 ? `/${route.params?.join('/') ?? ''}` : '';
          return (
            <Route
              key={`${route.id}`}
              path={`/${route.id}`}
              element={
                <ScaleContainer
                  designWidth={route?.configuration?.deviceScreen?.size?.width}
                  designHeight={route?.configuration?.deviceScreen?.size?.height}
                  className="w-[auto] bg-white"
                >
                  <ElementRenderer
                    params={params}
                    allComponentsRaw={components || []}
                    setAppStatePartial={setAppStatePartial}
                    parentStyle={route?.style || {}}
                    propsData={propsData}
                    // propsData={propsData}
                    targets={[]}
                    dispatch={dispatch}
                    elements={route?.layout}
                    readOnly={false}
                    tab={route?.id}
                    navigate={navigate}
                    appState={appState || {}}
                    parentId={null}
                    editMode={false}
                    // setSelectedElements={setSelectedTargets}
                    // isDragging={isDragging}
                    currentApplication={appConfig}
                    // builderCursorMode={builderCursorMode}
                    store={store}
                    // refreshAppAuth={refreshAppAuth}
                    setDestroyInfo={setDestroyInfo}
                    setSessionInfo={setSessionInfo}
                    storeInvocation={storeInvocation}
                  />
                </ScaleContainer>
              }
            />
          );
        })}{' '}
        <Route
          path="/"
          element={
            <ScaleContainer
              designWidth={defaultPage?.configuration?.deviceScreen?.size?.width}
              designHeight={defaultPage?.configuration?.deviceScreen?.size?.height}
              // style={parentStyle}
            >
              <ElementRenderer
                params={params}
                allComponentsRaw={components || []}
                setAppStatePartial={setAppStatePartial}
                // setAppStatePartial={setAppStatePartial}
                // parentStyle={}
                parentStyle={defaultPage?.style}
                propsData={appState?.[defaultPage?.id]}
                // propsData={propsData}
                targets={[]}
                // dispatch={useDispatch()}
                elements={defaultPage?.layout}
                readOnly={false}
                tab={defaultPage?.id}
                navigate={navigate}
                // appState={{}}
                appState={appState || {}}
                parentId={null}
                editMode={false}
                // setSelectedElements={setSelectedTargets}
                // isDragging={isDragging}
                currentApplication={appConfig}
                // builderCursorMode={builderCursorMode}
                store={store}
                dispatch={dispatch}
                // refreshAppAuth={refreshAppAuth}
                setDestroyInfo={setDestroyInfo}
                setSessionInfo={setSessionInfo}
                storeInvocation={storeInvocation}
              />
              {/* {defaultPage?.name} */}
            </ScaleContainer>
          }
        />
      </Routes>
    </Suspense>
  );
};
export default Views;
