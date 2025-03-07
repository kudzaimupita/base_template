import { Route, Routes, useNavigate } from 'react-router-dom';
import store, { setDestroyInfo, setSessionInfo } from '@/store';

import ElementRenderer from '../lib/RenderElements';
import { Suspense } from 'react';
import appConfig from '../../appConfig.json';
import { storeInvocation } from '@/services/invocationService';

// const appConfig = JSON.parse(import.meta.env.VITE_APP_CONFIG || '{}');

const Views = () => {
  // const navigate = useNavigate();
  return (
    <Suspense fallback={<div className="flex flex-auto flex-col h-[100vh]">{/* <ModernSpinner /> */}</div>}>
      <Routes>
        {appConfig.views?.map((route) => {
          // const routeParams = (route?.params?.length ?? 0) > 0 ? `/${route.params?.join('/') ?? ''}` : '';
          return (
            <Route
              key={`${route.id}`}
              path={`/${route.id}`}
              element={
                <div className="w-[auto] bg-white">
                  {' '}
                  <ElementRenderer
                    setAppStatePartial={() => ''}
                    parentStyle={route?.style || {}}
                    // propsData={propsData}
                    // propsData={propsData}
                    targets={[]}
                    dispatch={() => ''}
                    elements={route?.layout}
                    readOnly={false}
                    tab={route?.id}
                    // navigate={navigate}
                    appState={{}}
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
                  rtfgtrg
                </div>
              }
            />
          );
        })}{' '}
        <Route
          path="/"
          element={
            <>
              <ElementRenderer
                // setAppStatePartial={setAppStatePartial}
                // parentStyle={}
                parentStyle={appConfig?.views?.[0]?.style}
                // propsData={propsData}
                // propsData={propsData}
                targets={[]}
                // dispatch={useDispatch()}
                elements={appConfig?.views?.[0]?.layout}
                readOnly={false}
                tab={appConfig?.views?.[0]?.id}
                // navigate={navigate}
                appState={{}}
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
              {/* {appConfig?.views?.[0]?.name} */}
            </>
          }
        />
      </Routes>
    </Suspense>
  );
};
export default Views;
