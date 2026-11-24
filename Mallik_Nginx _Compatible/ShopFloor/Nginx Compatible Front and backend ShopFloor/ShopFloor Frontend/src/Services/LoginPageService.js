/* eslint-disable max-len */
import ApplicationStore from '../utils/localStorageUtil';

const successCaseCode = [200, 201];

const _fetchService = (PATH, serviceMethod, data, successCallback, errorCallBack) => {
    const { accessToken, userDetailss, date } = ApplicationStore().getStorage('userDetails');

    const BASE_URL = process.env.REACT_APP_NODE_API_URL || '';
    const END_POINT = `${BASE_URL}/api/`;

    const headers = {
        'Content-Type': 'application/json',
        authorization: `Bearer ${accessToken}`,
        currentDate: date
        // companyCode: `${companyCode}`,
        // userId: `${email}`,
        // userRole: `${userRole}`,
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
            if (error && typeof error.errorObject?.then === 'function') {
                error.errorObject.then((errorResponse) => {
                    if (error.errorStatus === 401 && errorResponse.message === 'Unable to access the page, Token Expired') {
                        ApplicationStore().clearStorage();
                    }
                    errorCallBack && errorCallBack(error.errorStatus, errorResponse.message);
                }).catch(() => {
                    errorCallBack && errorCallBack(error.errorStatus, 'An error occurred');
                });
            } else {
                errorCallBack && errorCallBack(0, error?.message || 'Network error');
            }
        });
};

export const LoginService = (data) => {
    const PATH = 'authLogin';

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

export const FetchDeviceCategoryService = (successCallback, errorCallBack) => _fetchService('deviceCategory/showData', 'GET', {}, successCallback, errorCallBack);

export const FetchDeviceListService = (successCallback, errorCallBack) => _fetchService('edgeDevice/showData', 'GET', {}, successCallback, errorCallBack);

//Machine list
export const FetchMachineListService = (successCallback, errorCallBack) => _fetchService('Machine/showData', 'GET', {}, successCallback, errorCallBack);


export const FetchDeviceCategoryListService = (successCallback, errorCallBack) => _fetchService('deviceCategory/showData', 'GET', {}, successCallback, errorCallBack);

export const FetchCategoryDeviceListService = (data, successCallback, errorCallBack) => _fetchService('deviceList', 'POST', data, successCallback, errorCallBack);
export const AddMapMachineParameter = (data, successCallback, errorCallBack) => _fetchService('mapMachineParameter', 'POST', data, successCallback, errorCallBack);
export const EditMapMachineParameterService = (data, successCallback, errorCallBack) => _fetchService(`mapMachineParameter/${data.id}/update`, 'POST', data, successCallback, errorCallBack);
export const getMachinesAll = (successCallback, errorCallBack) => _fetchService('machineList/AllMachineList', 'GET', {}, successCallback, errorCallBack);

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


///AssignHelper////
export const ShowAssignMachine = (successCallback, errorCallBack) => _fetchService('report/machineList', 'GET', {}, successCallback, errorCallBack);
export const ShowAssignHelperList = (successCallback, errorCallBack) => _fetchService('assignHelpers/', 'GET', {}, successCallback, errorCallBack);
export const AssignHelperAddService = (data, successCallback, errorCallBack) => _fetchService('assignHelpers/', 'POST', data, successCallback, errorCallBack);
export const AssignHelperEditService = (data, successCallback, errorCallBack) => _fetchService(`assignHelpers/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const AssignHelperDeleteService = (data, successCallback, errorCallBack) => _fetchService(`assignHelpers/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

//MTTF and MTBF

export const MTTRData = (data, successCallback, errorCallBack) => _fetchService(`meanTime/MtbfMonitoringMachine/${data.id}`, 'GET', {}, successCallback, errorCallBack);

// export const ImportBreakdownDetails = (data, successCallback, errorCallBack) => _fetchService('mainReport/ImportBreakdownDetails', 'POST', data, successCallback, errorCallBack);

