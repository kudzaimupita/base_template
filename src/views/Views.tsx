import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import store, { setDestroyInfo, setSessionInfo } from '@/store';
import { useDispatch, useSelector } from 'react-redux';

import { ConfigProvider } from 'antd';
import ElementRenderer from '../lib/RenderElements';
import components from '../../components.json';
import { setAppStatePartial } from '@/store/slices/appState';
import { storeInvocation } from '@/services/invocationService';


const Views = () => {
  console.log('🚀 Views component initializing...');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();
  
  // Get current app from Redux store
  const currentAppSlice = useSelector((state: any) => state.currentApp);
  const appConfig = useSelector((state: any) => {
    console.log('🔍 Selector - Full state:', state);
    console.log('🔍 Selector - currentApp slice:', state.currentApp);
    return state.currentApp?.currentApplication;
  });
  const appState = useSelector((state: any) => state.appState);

  console.log('📊 Views - Redux State:', {
    appConfig,
    appState,
    params,
    currentAppSlice: useSelector((state: any) => state.currentApp)
  });

  useEffect(() => {
    console.log('🔧 Views useEffect triggered with appConfig:', appConfig);
    
    // Set document title from config
    if (appConfig?.title || appConfig?.name) {
      const title = appConfig?.title || appConfig?.name;
      console.log('📝 Setting document title to:', title);
      document.title = title;
    } else {
      console.log('⚠️ No title found in appConfig');
    }

    // Set favicon from base64 config
    if (appConfig?.icon) {
      console.log('🎨 Setting favicon from appConfig.icon');
      const link = (document.querySelector("link[rel~='icon']") || document.createElement('link')) as HTMLLinkElement;
      link.type = 'image/png';
      link.rel = 'icon';
      link.href = appConfig?.icon || '';
      document.getElementsByTagName('head')[0].appendChild(link);
    } else {
      console.log('⚠️ No icon found in appConfig');
    }
  }, [appConfig]);
  
  const getDefaultPage = (appConfig: any) => {
    console.log('🏠 Getting default page from appConfig:', appConfig);
    
    // Guard clause for missing appConfig
    if (!appConfig?.views?.length) {
      console.log('❌ No views found in appConfig, returning empty object');
      return {};
    }

    console.log('📄 Available views:', appConfig.views.map((v: any) => ({ id: v.id, name: v.name })));

    const defaultPageId = appConfig?.layoutSettings?.defaultPrivatePage;
    console.log('🎯 Default page ID from settings:', defaultPageId);

    // If defaultPrivatePage is set, try to find that view
    if (defaultPageId) {
      const specifiedPage = appConfig.views.find((view: any) => view.id === defaultPageId);
      console.log('🔍 Found specified page:', specifiedPage);
      // Return found page or fallback to first view
      const result = specifiedPage || appConfig.views[0];
      console.log('✅ Using specified/fallback page:', result);
      return result;
    }

    // If no defaultPrivatePage is set, use first view
    const firstView = appConfig.views[0];
    console.log('✅ Using first view as default:', firstView);
    return firstView;
  };
  
  const defaultPage = getDefaultPage(appConfig);
  console.log('🏠 Final default page:', defaultPage);
  console.log('🎨 Views rendering with:', {
    appConfigViews: appConfig?.views?.length || 0,
    defaultPageId: defaultPage?.id,
    hasComponents: !!components,
    appStateKeys: Object.keys(appState || {})
  });

  return (
    <Suspense fallback={<div className="bg-transparent">{/* <ModernSpinner /> */}</div>}>
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
          {appConfig?.views?.map((route: any) => {
            const propsData = appState?.[route?.id] || {};
            console.log(`🛣️ Creating route for ${route?.id}:`, {
              routeId: route?.id,
              routeName: route?.name,
              hasLayout: !!route?.layout,
              layoutLength: route?.layout?.length || 0,
              propsData,
              hasStyle: !!route?.style
            });
            
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
              <>
                {console.log('🏠 Rendering default route with:', {
                  defaultPageId: defaultPage?.id,
                  hasLayout: !!defaultPage?.layout,
                  layoutLength: defaultPage?.layout?.length || 0,
                  propsData: appState?.[defaultPage?.id]
                })}
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
