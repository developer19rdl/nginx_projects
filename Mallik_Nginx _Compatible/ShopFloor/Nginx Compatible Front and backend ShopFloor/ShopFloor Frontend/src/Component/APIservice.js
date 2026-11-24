
const successCaseCode = [200, 201];
const _fetchService = (PATH, serviceMethod, data, successCallback, errorCallBack) => {

  const BASE_URL = process.env.REACT_APP_NODE_API_URL || '';
  const END_POINT = `${BASE_URL}/api/`;


  const headers = {
    'Content-Type': 'application/json',
  };
  const body = (serviceMethod === 'GET') || (serviceMethod === 'DELETE') ? {} : { body: JSON.stringify(data) };
  const bodyParameters = {
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    headers,
    ...body,
  };
  const bodyObject = {
    method: serviceMethod,
    ...bodyParameters,
  };
  return fetch(END_POINT + PATH, bodyObject)

    .then((response) => {
      if (successCaseCode.indexOf(response.status) > -1) {
        return response.json();

      }
      // eslint-disable-next-line no-throw-literal
      throw {
        errorStatus: response.status,
        errorObject: response.json(),

      };
    })
    .then((dataResponse) => successCallback(dataResponse))
    .catch((error) => {
      error?.errorObject?.then((errorResponse) => {
        if (error?.errorStatus === 401 && errorResponse?.message === 'Unable to access the page, Token Expired') {
        }
        errorCallBack(error?.errorStatus, errorResponse?.message);
      });
    });
};
export const LoginService = (data) => {
  const PATH = 'login';
  const BASE_URL = process.env.REACT_APP_NODE_API_URL || '';
  const END_POINT = `${BASE_URL}/api/`;


  const SERVICE_METHOD = 'POST';
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  return fetch(END_POINT + PATH, {
    method: SERVICE_METHOD,
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers,
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data),
  });
};

export const unitsShowDataService = (successCallback, errorCallBack) => _fetchService('units/showData', 'GET', {}, successCallback, errorCallBack);

export const UnitAddService = (data, successCallback, errorCallBack) => _fetchService('units/add', 'POST', data, successCallback, errorCallBack);

export const UnitUpdateService = (data, successCallback, errorCallBack) => _fetchService(`units/${data.id}/update`, 'POST', data, successCallback, errorCallBack);

export const DeletUnitService = (id, successCallback, errorCallBack) => _fetchService(`units/${id}/delete`, 'POST', {}, successCallback, errorCallBack);
