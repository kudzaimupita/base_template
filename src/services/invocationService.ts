import axios from 'axios';
import { del, get, patch, post, post2 } from './api_helper_client';

// import ApiService from './GenericApiService';

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
const requestHasFiles = (data: any): boolean => {
  if (data instanceof FormData) {
    for (const value of data.values()) {
      if (value instanceof File) {
        return true;
      }
    }
  }
  return false;
};
export const storeInvocation = (
  formData,
  appId,
  path,
  component,
  view,
  headers,
  env = 'development',
  controller,
  method,
  queryParams = ''
): any => {
  const url = `${(import.meta as any).env.VITE_CLIENT_API_URL}/v1/apps/${env}/${appId}${path && path.length > 0 ? path : ''}${queryParams ? `?${queryParams}` : ''}`;

  // Enhanced form data handling based on controller configuration
  const formDataConfig = controller?.formDataConfig || {};
  const hasFiles = requestHasFiles(formData);
  const shouldUseFormData = hasFiles || (formDataConfig.enabled !== false && formDataConfig.mode !== 'none');

  // Prepare headers with form data configuration context
  const enhancedHeaders = {
    ...headers,
    'Content-Type': shouldUseFormData ? 'multipart/form-data' : 'application/json',
  };

  // Add form data configuration metadata for backend processing
  if (shouldUseFormData && formDataConfig.enabled !== false) {
    const configData = {
      mode: formDataConfig.mode || 'any',
      maxFileSize: formDataConfig.maxFileSize || 50000000,
      allowedMimeTypes: formDataConfig.allowedMimeTypes || [],
      fieldConfigs: formDataConfig.fieldConfigs || [],
      customValidation: formDataConfig.customValidation || null
    };
    enhancedHeaders['X-FormData-Config'] = JSON.stringify(configData);
  }

  return axios.request({
    url,
    method: method || 'post',
    data: formData,
    headers: enhancedHeaders,
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
