/* eslint-disable max-len */
import ApplicationStore from '../utils/localStorageUtil';

const successCaseCode = [200, 201];

const _fetchService = (PATH, method, data, successCallback, errorCallBack) => {
  const { accessToken, date } = ApplicationStore().getStorage('userDetails');

  const BASE_URL = process.env.REACT_APP_NODE_API_URL || '';
  const END_POINT = `${BASE_URL}/api/`;

  const headers = {
    authorization: `Bearer ${accessToken}`,
    currentDate: date
    // ❌ DO NOT set Content-Type here
  };

  const options = {
    method,
    headers
  };

  /** ✅ IMPORTANT: Handle FormData correctly */
  if (data instanceof FormData) {
    options.body = data; // browser sets boundary
  } else if (method !== 'GET' && method !== 'DELETE') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(data);
  }

  return fetch(END_POINT + PATH, options)
    .then(async (response) => {
      const result = await response.json();
      if (successCaseCode.includes(response.status)) {
        return result;
      }
      throw {
        errorStatus: response.status,
        errorMessage: result.message
      };
    })
    .then(successCallback)
    .catch((error) => {
      if (error.errorStatus === 401) {
        ApplicationStore().clearStorage();
      }
      errorCallBack(error.errorStatus, error.errorMessage);
    });
};


export const ImportBreakdownDetails = (file, successCallback, errorCallBack) => {
  const formData = new FormData();
  formData.append('file', file); // ✅ REAL File object

  _fetchService(
    'mainReport/ImportBreakdownDetails',
    'POST',
    formData,
    successCallback,
    errorCallBack
  );
};
