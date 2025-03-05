import { get, post, del, patch, post2 } from './api_helper';

import ApiService from './GenericApiService';

export const getInvocationLogs = () => {
  return new Promise((resolve, reject) => {
    get(`/invocationLogs`)
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
};

export async function getInvocationLog(id: any) {
  return ApiService.fetchData({
    url: `/invocationLogs/${id}`,
    method: 'get',
  });
}
export const checkout = (body: any) => {
  return new Promise((resolve, reject) => {
    post(`/invocationLogs/checkout`, body)
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
};

export const updateSubscription = (body: any) => {
  return new Promise((resolve, reject) => {
    post(`/invocationLogs/updateSubscription`, body)
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
};

export const storeInvocationLog = (formData, appId, controllerId, moduleId): any => {
  return new Promise((resolve, reject) => {
    return post2(`/invocationLogs/${appId}/${moduleId}/${controllerId}`, formData)
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const storeInvocationLogModule = (formData: any, id: any): any => {
  return new Promise((resolve, reject) => {
    return post2(`/invocationLogs/module/${id}`, formData)
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
export const storeInvocationLogView = (formData: any, id: any): any => {
  return new Promise((resolve, reject) => {
    return post2(`/invocationLogs/view/${id}`, formData)
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
export const updateInvocationLogModule = (formData: any, id: any): any => {
  return new Promise((resolve, reject) => {
    return patch(`/invocationLogs/module/${id}`, formData)
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const deleteInvocationLogModule = (id, moduleId): any => {
  return new Promise((resolve, reject) => {
    return del(`/invocationLogs/module/${id}/${moduleId}`)
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
export const updateInvocationLogView = (formData: any, id: any): any => {
  return new Promise((resolve, reject) => {
    return patch(`/invocationLogs/view/${id}`, formData)
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const deleteInvocationLog = (id: any) => {
  return new Promise((resolve, reject) => {
    del(`/invocationLogs/${id}`)
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
};

export async function getNewInvocationLogLogs(params: any) {
  return ApiService.fetchData({
    url: '/invocationLogs',
    method: 'get',
    params,
  });
}

export async function getInvocationLogCount(params: any) {
  return ApiService.fetchData({
    url: '/invocation-logs/stats/aggregated',
    method: 'get',
    params,
  });
}

export const deleteInvocationLogLogs = (formData: any) => {
  return new Promise((resolve, reject) => {
    return post2(`/invocationLogs/deleteInvocationLogLogs`, formData)
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
