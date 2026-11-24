
const successCaseCode = [200, 201];
const _fetchService = (PATH, serviceMethod, data, successCallback, errorCallBack) => {

  const END_POINT = 'http://192.168.1.85:8000/api/';

  // const END_POINT = 'http://192.168.1.141/MallikShopFloor/MallikServer/api/';


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
  // const END_POINT = 'http://192.168.1.141/MallikShopFloor/MallikServer/api/';
  const END_POINT = 'http://192.168.1.85:8000/api/';


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

// ─── Energy Saving Module ────────────────────────────────────────────────────

// Energy Waste Detection
export const EnergyWasteFetchService = (successCallback, errorCallBack) => _fetchService('energySaving/waste', 'GET', {}, successCallback, errorCallBack);
export const EnergyWasteAddService = (data, successCallback, errorCallBack) => _fetchService('energySaving/waste', 'POST', data, successCallback, errorCallBack);
export const EnergyWasteUpdateService = (data, successCallback, errorCallBack) => _fetchService(`energySaving/waste/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const EnergyWasteDeleteService = (id, successCallback, errorCallBack) => _fetchService(`energySaving/waste/${id}`, 'DELETE', {}, successCallback, errorCallBack);

// Corrective Action Recommendations
export const EnergyCorrFetchService = (successCallback, errorCallBack) => _fetchService('energySaving/corrective', 'GET', {}, successCallback, errorCallBack);
export const EnergyCorrAddService = (data, successCallback, errorCallBack) => _fetchService('energySaving/corrective', 'POST', data, successCallback, errorCallBack);
export const EnergyCorrUpdateService = (data, successCallback, errorCallBack) => _fetchService(`energySaving/corrective/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const EnergyCorrDeleteService = (id, successCallback, errorCallBack) => _fetchService(`energySaving/corrective/${id}`, 'DELETE', {}, successCallback, errorCallBack);
