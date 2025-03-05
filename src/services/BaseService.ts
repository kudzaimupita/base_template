import { TOKEN_TYPE } from '@/constants/api.constant';
import axios from 'axios';
import store from '../store';

const unauthorizedCode = [401];

const BaseService = axios.create({
  timeout: 60000,
  baseURL: `${import.meta.env.VITE_API_URL}/v1`,
});

BaseService.interceptors.request.use(
  async (config) => {
    // const rawPersistData = localStorage.getItem(PERSIST_STORE_NAME);

    // Get the accessToken and refreshToken from the parsed data

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

BaseService.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response && unauthorizedCode.includes(response.status)) {
      // message.error('Unauthorized Error, please sign out and try back in');
      store.dispatch({ type: 'LOGOUT' });
    }

    return Promise.reject(error);
  }
);

export default BaseService;
