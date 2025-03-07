import { del, get, patch, post, post2 } from './api_helper_client';

export const storeInvocation = (formData, appId, controllerId, component, view, headers): any => {
  return new Promise((resolve, reject) => {
    return post2(`/invocations/${appId}/${controllerId}?component=${component}&view=${view}`, formData, {
      headers: { ...headers },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const storeInvocationModule = (formData: any, id: any): any => {
  return new Promise((resolve, reject) => {
    return post2(`/invocations/module/${id}`, formData)
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
export const storeInvocationView = (formData: any, id: any): any => {
  return new Promise((resolve, reject) => {
    return post2(`/invocations/view/${id}`, formData)
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
export const updateInvocationModule = (formData: any, id: any): any => {
  return new Promise((resolve, reject) => {
    return patch(`/invocations/module/${id}`, formData)
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const deleteInvocationModule = (id, moduleId): any => {
  return new Promise((resolve, reject) => {
    return del(`/invocations/module/${id}/${moduleId}`)
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
export const updateInvocationView = (formData: any, id: any): any => {
  return new Promise((resolve, reject) => {
    return patch(`/invocations/view/${id}`, formData)
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const deleteInvocation = (id: any) => {
  return new Promise((resolve, reject) => {
    del(`/invocations/${id}`)
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
};

export const deleteInvocations = (formData: any) => {
  return new Promise((resolve, reject) => {
    return post2(`/invocations/deleteInvocations`, formData)
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
