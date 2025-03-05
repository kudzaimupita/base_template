import axios from 'axios';

// import { TOKEN_TYPE } from 'constants/api.constant'
// import { PERSIST_STORE_NAME } from 'constants/app.constant'

// import { Notification, toast } from 'components/ui'

const API_URL = `${import.meta.env.VITE_CLIENT_API_URL}/v1`;

const axiosApi = axios.create({
  baseURL: API_URL,
});

const unauthorizedCode = [401];

// axiosApi.interceptors.request.use(
//   async (config) => {
//     // Retrieve and parse the data from localStorage
//     // const rawPersistData = localStorage.getItem(PERSIST_STORE_NAME);

//     // Get the accessToken and refreshToken from the parsed data
//     const accessToken = store.getState()?.auth?.session?.token;
//     const refreshToken = store.getState()?.auth?.session?.refreshToken;

//     // If refreshToken is available, add it to the request headers
//     if (refreshToken) {
//       config.headers['refreshToken'] = refreshToken;
//       config.headers.sensitive = true;
//     }
//     config.headers['company'] = '6594497b0b9185ef9fbd53db';
//     // If accessToken is available, add it to the request headers
//     if (accessToken) {
//       config.headers['authorization'] = `${TOKEN_TYPE}${accessToken}`;
//       config.headers['company'] = store.getState()?.auth?.company?._id;
//       config.headers['site'] = store.getState()?.auth?.site?._id;
//       config.headers.sensitive = true;
//     }

//     // Return the modified config
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// axiosApi.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const { response } = error;
//     if (response && unauthorizedCode.includes(response.status)) {
//       message.error('Unauthorized Error, please ssign out and try back in');
//       // toast.push(
//       //     <Notification title={'Session expired'} type="info">
//       //         Session Expired
//       //     </Notification>
//       // )
//     }

//     return Promise.reject(error);
//   }
// );

axiosApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export async function get(url, config = {}) {
  return await axiosApi
    .get(url, { ...config })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {});
}

export async function post2(url, data, config = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await axiosApi.post(API_URL + url, data, config);
      return resolve(res);
    } catch (err) {
      console.log(err);
      const errors = err.response?.data?.error?.message;
      const errorArray = errors?.split(',');
      return reject(errorArray);
    }
  });
}

export async function patch(url, data, config = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await axiosApi.patch(API_URL + url, data);
      return resolve(res);
    } catch (err) {
      const errors = err?.response?.data?.error?.message;
      const errorArray = errors?.split(',');

      return reject(errorArray);
    }
  });
}

export async function postModuleData(url, data, config = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await axiosApi.post(API_URL + url, data);
      return resolve(res);
    } catch (err) {
      const errors = err?.response?.data?.error?.message;
      if (err.response.data.error.code === 'LIMIT_FILE_SIZE') {
        return reject([
          {
            key: err.response.data.error.field,
            message: 'too large',
          },
        ]);
      }
      return reject(JSON.parse(errors));
    }
  });
}

export async function validateSchemaData(url, data, config = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await axiosApi.post(API_URL + url, data);
      return resolve(res);
    } catch (err) {
      const errors = err?.response?.data?.error?.message;
      if (err.response.data.error.code === 'LIMIT_FILE_SIZE') {
        return reject([
          {
            key: err.response.data.error.field,
            message: 'too large',
          },
        ]);
      }
      return reject(JSON.parse(errors));
    }
  });
}

export async function post(url, data, config = {}) {
  return axiosApi
    .post(url, { ...data }, { ...config })
    .then((response) => response.data)
    .catch((error) => error);
}
export async function put(url, data, config = {}) {
  return axiosApi
    .put(url, { ...data }, { ...config })
    .then((response) => response.data)
    .catch((error) => error);
}

export async function del(url, config = {}) {
  return await axiosApi
    .delete(url, { ...config })
    .then((response) => response.data)
    .catch((error) => error);
}

export async function patchModuleData(url, data, config = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await axiosApi.patch(API_URL + url, data, config);
      return resolve(res);
    } catch (err) {
      const errors = err?.response?.data?.error?.message;

      if (err.response.data.error.code === 'LIMIT_FILE_SIZE') {
        return reject([
          {
            key: err.response.data.error.field,
            message: 'too large',
          },
        ]);
      }
      return reject(JSON.parse(errors));
    }
  });
}
