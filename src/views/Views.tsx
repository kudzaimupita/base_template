import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import store, { setDestroyInfo, setSessionInfo } from '@/store';
import { useDispatch, useSelector } from 'react-redux';

import { ConfigProvider } from 'antd';
import ElementRenderer from '../lib/RenderElements';
import appConfig from '../../appConfig.json';
import components from '../../components.json';
import { setAppStatePartial } from '@/store/slices/appState';
import { storeInvocation } from '@/services/invocationService';


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
      <ConfigProvider
        theme={{
          components: {},
          token: {
            colorText: '#B4b1b1', // Primary text color
            // colorBgContainer: 'transparent',
            fontFamily: "'Inter', sans-serif",
     
          },
          algorithm: null,
        }}
      >
        <Routes>
          {appConfig.views?.map((route) => {
            const propsData = appState?.[route?.id] || {};
            // const routeParams = (route?.params?.length ?? 0) > 0 ? `/${route.params?.join('/') ?? ''}` : '';
            return (
              <Route
                key={`${route.id}`}
                path={`/${route.id}`}
                element={
                  <
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
                  </>
                }
              />
            );
          })}{' '}
          <Route
            path="/"
            element={
              <
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
              </>
            }
          />
        </Routes>
      </ConfigProvider>
    </Suspense>
  );
};
export default Views;
