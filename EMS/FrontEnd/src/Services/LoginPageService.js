/* eslint-disable max-len */
import ApplicationStore from '../utils/localStorageUtil';

const successCaseCode = [200, 201];

// Dedupe concurrent refresh attempts so a burst of 401s only triggers one refresh call
let refreshTokenPromise = null;

const redirectToLogin = () => {
    ApplicationStore().clearStorage();
    window.location.hash = '/Sign_in';
    window.location.reload();
};

// Access tokens expire after SECRET_KEY_EXP (2h). Use the longer-lived refreshToken
// to silently obtain a new one instead of leaving the user stuck with failed requests.
const requestNewAccessToken = () => {
    if (refreshTokenPromise) return refreshTokenPromise;

    const { refreshToken } = ApplicationStore().getStorage('userDetails') || {};
    if (!refreshToken) return Promise.reject(new Error('No refresh token available'));

    const END_POINT = process.env.REACT_APP_EMS_API_URL;

    refreshTokenPromise = fetch(`${END_POINT}authLogin/refreshToken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
    })
        .then((res) => {
            if (!res.ok) throw new Error('Refresh token request failed');
            return res.json();
        })
        .then((data) => {
            if (!data?.success || !data?.accessToken) throw new Error('Refresh token request failed');
            const stored = ApplicationStore().getStorage('userDetails') || {};
            ApplicationStore().setStorage('userDetails', { ...stored, accessToken: data.accessToken });
            return data.accessToken;
        })
        .finally(() => { refreshTokenPromise = null; });

    return refreshTokenPromise;
};

const _fetchService = (PATH, serviceMethod, data, successCallback, errorCallBack, _isRetry = false) => {
    const { accessToken } = ApplicationStore().getStorage('userDetails') || {};

    const END_POINT = process.env.REACT_APP_EMS_API_URL;

    const headers = {
        'Content-Type': 'application/json',
        authorization: `Bearer ${accessToken}`,
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
            // Access token expired — refresh once, silently retry the original call
            if (error.errorStatus === 401 && !_isRetry) {
                requestNewAccessToken()
                    .then(() => _fetchService(PATH, serviceMethod, data, successCallback, errorCallBack, true))
                    .catch(() => redirectToLogin());
                return;
            }
            error.errorObject.then((errorResponse) => {
                if (error.errorStatus === 401) {
                    redirectToLogin();
                }
                errorCallBack(error.errorStatus, errorResponse?.message);
            });
        });
};

export const LoginService = (data) => {
    const PATH = 'authLogin';
    // const END_POINT = 'http://192.168.1.141/MallikShopFloor/MallikServer/api/';
    // const END_POINT = 'http://125.18.47.138:8000/api/';
    // const END_POINT = 'http://192.168.1.85:8004/api/';
    const END_POINT = process.env.REACT_APP_EMS_API_URL;


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

export const FetchDeviceCategoryService = (successCallback, errorCallBack) => _fetchService('deviceCategory/showData', 'GET', {}, successCallback, errorCallBack);

export const FetchDeviceListService = (successCallback, errorCallBack) => _fetchService('edgeDevice/showData', 'GET', {}, successCallback, errorCallBack);

//Machine list
export const FetchMachineListService = (successCallback, errorCallBack) => _fetchService('Machine/showData', 'GET', {}, successCallback, errorCallBack);


export const FetchDeviceCategoryListService = (successCallback, errorCallBack) => _fetchService('deviceCategory/showData', 'GET', {}, successCallback, errorCallBack);



export const FetchCategoryDeviceListService = (data, successCallback, errorCallBack) => _fetchService('deviceList', 'POST', data, successCallback, errorCallBack);

export const AddMapMachineParameter = (data, successCallback, errorCallBack) => _fetchService('mapMachineParameter', 'POST', data, successCallback, errorCallBack);

export const EditMapMachineParameterService = (data, successCallback, errorCallBack) => _fetchService(`mapMachineParameter/${data.id}/update`, 'POST', data, successCallback, errorCallBack);

// TAG API SERVICES
export const AddTagService = (data, successCallback, errorCallBack) => _fetchService('sensor/add', 'POST', data, successCallback, errorCallBack);
export const TagEditService = (data, successCallback, errorCallBack) => _fetchService(`sensor/${data.id}/update`, 'POST', data, successCallback, errorCallBack);
export const FetchTagService = (successCallback, errorCallBack) => _fetchService('sensor/showData', 'GET', {}, successCallback, errorCallBack);
export const TagExcelUpload = (data, successCallback, errorCallBack) => _fetchService('tag/import', 'POST', data, successCallback, errorCallBack);
export const deleteTagService = (data, successCallback, errorCallBack) => _fetchService(`sensor/${data.id}/delete`, 'POST', data, successCallback, errorCallBack);

//MACHINE ALLOCATION SERVICES
// export const getMachinesList = (successCallback, errorCallBack) => _fetchService('Machine/showData', 'GET', {}, successCallback, errorCallBack);
export const getCategory = (successCallback, errorCallBack) => _fetchService('deviceCategory/showData', 'GET', {}, successCallback, errorCallBack);
export const getDeviceList = (data, successCallback, errorCallBack) => _fetchService('deviceList', 'POST', data, successCallback, errorCallBack);
export const getTagList = (data, successCallback, errorCallBack) => _fetchService('DevTagList', 'POST', data, successCallback, errorCallBack);
export const mapMachineAllocation = (data, successCallback, errorCallBack) => _fetchService('mapMachineParameter', 'POST', data, successCallback, errorCallBack);
export const MachineAllocationExcelUpload = (data, successCallback, errorCallBack) => _fetchService('machineAllocation/import', 'POST', data, successCallback, errorCallBack);
export const showAllocatedMachine = (successCallback, errorCallBack) => _fetchService('mapMachineParam/showData', 'GET', {}, successCallback, errorCallBack);
export const updateMachineAllocation = (data, successCallback, errorCallBack) => _fetchService(`mapMachineParam/${data.id}/update`, 'POST', data, successCallback, errorCallBack);
export const MachineAllocationDeleteService = (data, successCallback, errorCallBack) => _fetchService(`mapMachineParam/${data.id}/delete`, 'POST', data, successCallback, errorCallBack);
export const MachineAllocationUpdate = (data, successCallback, errorCallBack) => _fetchService(`mapMachineParam/${data.id}/update`, 'POST', data, successCallback, errorCallBack);

//METER ALLOCATION
export const FetchMeterService = (successCallback, errorCallBack) => _fetchService('meters/showData', 'GET', {}, successCallback, errorCallBack);
export const MeterAddService = (data, successCallback, errorCallBack) => _fetchService('meter/add', 'POST', data, successCallback, errorCallBack);
export const MeterEditService = (data, successCallback, errorCallBack) => _fetchService(`meter/${data.id}/update`, 'POST', data, successCallback, errorCallBack);
export const MeterDeleteService = (data, successCallback, errorCallBack) => _fetchService(`meter/${data.id}/delete`, 'POST', data, successCallback, errorCallBack);
export const MeterAllocationExcelUpload = (data, successCallback, errorCallBack) => _fetchService('meter/import', 'POST', data, successCallback, errorCallBack);
// export const getDeviceSlaveId = (data, successCallback, errorCallBack) => _fetchService('slaveIdList', 'POST', data, successCallback, errorCallBack);

// SCADA SERVICES
export const DevicesFetchShowService = (data, successCallback, errorCallBack) => _fetchService('device/showByUser', 'POST', data, successCallback, errorCallBack);
export const SearchDevicesFetchService = (data, successCallback, errorCallBack) => _fetchService('device/search', 'POST', data, successCallback, errorCallBack);
export const ShowSelectDropDown = (data, successCallback, errorCallBack) => _fetchService('scada/dropdown', 'POST', data, successCallback, errorCallBack);
export const ShowSelectSensors = (data, successCallback, errorCallBack) => _fetchService('DevTagList', 'POST', data, successCallback, errorCallBack);
export const ShowScadaServiceList = (data, successCallback, errorCallBack) => _fetchService('scada/showData', 'POST', data, successCallback, errorCallBack);
export const AddScadaService = (data, successCallback, errorCallBack) => _fetchService('scada/add', 'POST', data, successCallback, errorCallBack);
export const GetScadaChartDataService = (data, successCallback, errorCallBack) => _fetchService('scada/chartData', 'POST', data, successCallback, errorCallBack);
export const GetScadaTagsByDevicesService = (data, successCallback, errorCallBack) => _fetchService('scada/tagsByDevices', 'POST', data, successCallback, errorCallBack);
export const GetScadaCombinedChartDataService = (data, successCallback, errorCallBack) => _fetchService('scada/combinedChartData', 'POST', data, successCallback, errorCallBack);
export const DeleteScadaService = (id, successCallback, errorCallBack) => _fetchService(`scada/${id}/delete`, 'POST', {}, successCallback, errorCallBack);
export const CreateScadaNameService = (data, successCallback, errorCallBack) => _fetchService('scadaName/add', 'POST', data, successCallback, errorCallBack);
export const UpdateScadaNameService = (data, successCallback, errorCallBack) => _fetchService(`scadaName/${data.id}/update`, 'POST', data, successCallback, errorCallBack);
export const ShowScadaNameListService = (data, successCallback, errorCallBack) => _fetchService('scadaName/showData', 'POST', data, successCallback, errorCallBack);
export const DeleteScadaTabService = (data, successCallback, errorCallBack) => _fetchService(`scadaName/${data.tabIndex}/deleteTab`, 'POST', data, successCallback, errorCallBack);

// SCADA Dynamic Table
export const SaveScadaTableService = (data, successCallback, errorCallBack) => _fetchService('scadaTable/save', 'POST', data, successCallback, errorCallBack);
export const ShowScadaTableService = (data, successCallback, errorCallBack) => _fetchService('scadaTable/showData', 'POST', data, successCallback, errorCallBack);
export const DeleteScadaTableService = (id, successCallback, errorCallBack) => _fetchService(`scadaTable/${id}/delete`, 'POST', {}, successCallback, errorCallBack);

// SCADA Hyperlink Areas
export const SaveScadaHyperlinkService = (data, successCallback, errorCallBack) => _fetchService('scadaHyperlink/save', 'POST', data, successCallback, errorCallBack);
export const ShowScadaHyperlinkService = (data, successCallback, errorCallBack) => _fetchService('scadaHyperlink/showData', 'POST', data, successCallback, errorCallBack);
export const DeleteScadaHyperlinkService = (id, successCallback, errorCallBack) => _fetchService(`scadaHyperlink/${id}/delete`, 'POST', {}, successCallback, errorCallBack);

// Slave ID list filtered by selected device
export const ScadaFetchSlaveIds = (data, successCallback, errorCallBack) => _fetchService(`MachineAllocation/showslaveId/${data.edgeDeviceId}`, 'POST', data, successCallback, errorCallBack);

// SCADA background image upload – uses FormData (multer), NOT JSON
export const ScadaUploadImage = (formData, successCallback, errorCallBack) => {
    const { accessToken } = ApplicationStore().getStorage('userDetails');
    const END_POINT = process.env.REACT_APP_EMS_API_URL;
    fetch(`${END_POINT}scada/uploadImage`, {
        method: 'POST',
        headers: { authorization: `Bearer ${accessToken}` }, // no Content-Type; browser sets multipart boundary
        body: formData,
    })
        .then(res => res.json())
        .then(data => successCallback(data))
        .catch(err => errorCallBack(err));
};




