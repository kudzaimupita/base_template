import { del, get, patch, post, post2 } from './api_helper_client';

import ApiService from './GenericApiService';

export const getInvocations = () => {
  return new Promise((resolve, reject) => {
    get(`/invocations`)
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
};

export const getSettings = () => {
  return new Promise((resolve, reject) => {
    get(`/invocations/settings`)
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
};

export async function getInvocation(id: any) {
  return ApiService.fetchData({
    url: `/invocations/${id}`,
    method: 'get',
  });
}
export const checkout = (body: any) => {
  return new Promise((resolve, reject) => {
    post(`/invocations/checkout`, body)
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
};

export const updateSubscription = (body: any) => {
  return new Promise((resolve, reject) => {
    post(`/invocations/updateSubscription`, body)
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
};

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

export async function getNewInvocations(params: any) {
  return ApiService.fetchData({
    url: '/invocations',
    method: 'get',
    params,
  });
}

// export async function getSettings(params: any) {
//     return ApiService.fetchData({
//         url: '/invocations/settings',
//         method: 'get',
//         params,
//     })
// }

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
