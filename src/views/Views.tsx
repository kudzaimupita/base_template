import { Route, Routes } from 'react-router-dom';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import ElementRenderer from 'servlygroup/lib/RenderElements';
import type { LayoutType } from '@/@types/theme';

const appConfig = JSON.parse(import.meta.env.VITE_APP_CONFIG || '{}');

const Views = () => {
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
                    // setAppStatePartial={setAppStatePartial}
                    parentStyle={route?.style || {}}
                    // propsData={propsData}
                    // propsData={propsData}
                    targets={[]}
                    // dispatch={dispatch}
                    elements={route?.layout}
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
                    // store={store}
                    // refreshAppAuth={refreshAppAuth}
                    // setDestroyInfo={setDestroyInfo}
                    // setSessionInfo={setSessionInfo}
                    // storeInvocation={storeInvocation}
                  />
                  rtfgtrg
                </div>
              }
            />
          );
        })}
      </Routes>
    </Suspense>
  );
};
export default Views;
