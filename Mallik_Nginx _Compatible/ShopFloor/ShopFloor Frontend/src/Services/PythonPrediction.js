import ApplicationStore from '../utils/localStorageUtil';
const successCaseCode = [200, 201];

const _fetchService = (PATH, serviceMethod, data, successCallback, errorCallBack) => {
    const { token } = ApplicationStore().getStorage('userDetails');
   
    // local
    // const END_POINT = 'http://192.168.1.86:8006/';
    const END_POINT = process.env.REACT_APP_PYTHON_API_URL;
    // SERVER
    // const END_POINT = 'http://192.168.1.4:8006/';

    const headers = {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
    };

    const requestOptions = {
        method: serviceMethod,
        headers,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
    };

    if (serviceMethod === 'POST' || serviceMethod === 'PUT') {
        requestOptions.body = JSON.stringify(data);
    }

    return fetch(END_POINT + PATH, requestOptions)
        .then((response) => {
            if (successCaseCode.includes(response.status)) {
                return response.json();
            }
            return response.json().then((errorResponse) => {
                throw {
                    errorStatus: response.status,
                    errorObject: errorResponse,
                };
            });
        })
        .then((dataResponse) => successCallback(dataResponse))
        .catch((error) => {
            // Ensure errorObject and its properties are defined before accessing them
            const errorMessage = error?.errorObject?.message || 'An unknown error occurred';
            if (error.errorStatus === 401 && errorMessage === 'Unable to access the page, Token Expired') {
                ApplicationStore().clearStorage();
                // location.reload(); // Uncomment if you want to reload the page
            }
            errorCallBack(error.errorStatus, errorMessage);
        });
};

export const GetPowerSpikes = (successCallback, errorCallBack) => _fetchService('mallikgraph/kWh', 'GET', {}, successCallback, errorCallBack);
export const GetVibrationAnalysis = (successCallback, errorCallBack) => _fetchService('vibration_analysis', 'GET', {}, successCallback, errorCallBack);
