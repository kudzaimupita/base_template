import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import store, { setDestroyInfo, setSessionInfo } from '@/store';
import { useDispatch, useSelector } from 'react-redux';

import { ConfigProvider } from 'antd';
import ElementRenderer from '../lib/RenderElements';
import { setAppStatePartial } from '@/store/slices/appState';
import { storeInvocation } from '@/services/invocationService';

// Fetch JSON function (direct fetch from S3)
const fetchJSON = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load JSON from ${url}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching JSON:', error);
    return null;
  }
};

const ScaleContainer = ({
  designWidth = 1440,
  designHeight = 900,
  children,
  className = '',
  maxScale = 5,
  style,
  minScale = 0.3,
}) => {
  const calculateDimensions = useCallback(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let newScale = viewportWidth / designWidth;
    newScale = Math.min(Math.max(newScale, minScale), maxScale);
    const scaledWidth = designWidth * newScale;
    const scaledHeight = designHeight * newScale;
    const x = 0;
    const y = Math.max(0, (viewportHeight - scaledHeight) / 2);
    return { scale: newScale, position: { x, y } };
  }, [designWidth, designHeight, maxScale, minScale]);

  const initialDimensions = useMemo(() => calculateDimensions(), [calculateDimensions]);

  const [scale, setScale] = useState(initialDimensions.scale);
  const [position, setPosition] = useState(initialDimensions.position);

  useEffect(() => {
    const updateDimensions = () => {
      const newDimensions = calculateDimensions();
      setScale(newDimensions.scale);
      setPosition(newDimensions.position);
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [calculateDimensions]);

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
  const [appConfig, setAppConfig] = useState(null);
  const [components, setComponents] = useState(null);

  useEffect(() => {
    // Fetch appConfig and components from S3 URLs
    const loadData = async () => {
      const config = await fetchJSON(`https://servly-app-${import.meta.env.VITE_APP_ID}.s3.us-east-1.amazonaws.com/appConfig.json`);
      const comps = await fetchJSON(`https://servly-app-${import.meta.env.VITE_APP_ID}.s3.us-east-1.amazonaws.com/components.json`);
      

      if (config) setAppConfig(config);
      if (comps) setComponents(comps);
    };

    loadData();
  }, []);

  if (!appConfig || !components) {
    return <div>Loading...</div>;
  }

  const getDefaultPage = (appConfig) => {
    if (!appConfig?.views?.length) {
      return {};
    }

    const defaultPageId = appConfig?.layoutSettings?.defaultPrivatePage;
    if (defaultPageId) {
      const specifiedPage = appConfig.views.find((view) => view.id === defaultPageId);
      return specifiedPage || appConfig.views[0];
    }

    return appConfig.views[0];
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();
  const defaultPage = getDefaultPage(appConfig);
  const appState = useSelector((state) => state.appState);

  return (
    <Suspense fallback={<div className="flex flex-auto flex-col h-[100vh]"></div>}>
      <ConfigProvider
        theme={{
          components: {},
          token: {
            colorText: '#B4b1b1', // Primary text color
            fontFamily: "'Inter', sans-serif",
          },
        }}
      >
        <Routes>
          {appConfig.views?.map((route) => {
            const propsData = appState?.[route?.id] || {};
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
                      targets={[]}
                      dispatch={dispatch}
                      elements={route?.layout}
                      readOnly={false}
                      tab={route?.id}
                      navigate={navigate}
                      appState={appState || {}}
                      parentId={null}
                      editMode={false}
                      store={store}
                      setDestroyInfo={setDestroyInfo}
                      setSessionInfo={setSessionInfo}
                      storeInvocation={storeInvocation}
                    />
                  </ScaleContainer>
                }
              />
            );
          })}
          <Route
            path="/"
            element={
              <ScaleContainer
                designWidth={defaultPage?.configuration?.deviceScreen?.size?.width}
                designHeight={defaultPage?.configuration?.deviceScreen?.size?.height}
              >
                <ElementRenderer
                  params={params}
                  allComponentsRaw={components || []}
                  setAppStatePartial={setAppStatePartial}
                  parentStyle={defaultPage?.style}
                  propsData={appState?.[defaultPage?.id]}
                  targets={[]}
                  elements={defaultPage?.layout}
                  readOnly={false}
                  tab={defaultPage?.id}
                  navigate={navigate}
                  appState={appState || {}}
                  parentId={null}
                  editMode={false}
                  store={store}
                  dispatch={dispatch}
                  setDestroyInfo={setDestroyInfo}
                  setSessionInfo={setSessionInfo}
                  storeInvocation={storeInvocation}
                />
              </ScaleContainer>
            }
          />
        </Routes>
      </ConfigProvider>
    </Suspense>
  );
};

export default Views;
