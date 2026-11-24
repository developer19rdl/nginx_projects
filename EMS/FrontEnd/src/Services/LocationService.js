// import ApplicationStore from '../utils/localStorageUtil';

// const successCaseCode = [200, 201];

// const _fetchService = (PATH, serviceMethod, data, successCallback, errorCallBack) => {
//     const { token, userDetails } = ApplicationStore().getStorage('userDetails');

//     // CLIENT server
//     // const END_POINT = 'http://125.18.47.138:8000/api/';

//     // LOCAL
//     const END_POINT = 'http://192.168.1.74:8004/api/';

//     // const { companyCode } = userDetails;

//     const headers = {


//         'Content-Type': 'application/json',
//         authorization: `Bearer ${token}`,
//         // companyCode: `${companyCode}`,
//         // userId: `${email}`,
//         // userRole: `${userRole}`,
//     };
//     const body = (serviceMethod === 'GET') || (serviceMethod === 'DELETE') ? {} : { body: JSON.stringify(data) };


//     const bodyObject = {
//         method: serviceMethod,
//         ...bodyParameters,
//     };


// export const RegionShow = (successCallback, errorCallBack) => _fetchService('regions', 'GET', {}, successCallback, errorCallBack);

// export const RegionAddData = (data, successCallback, errorCallBack) => _fetchService('regions', 'POST', data, successCallback, errorCallBack);

// export const RegionAddUpdate = (data, successCallback, errorCallBack) => _fetchService(`regions/${data.id}`, 'PUT', data, successCallback, errorCallBack);

// export const RegionDelete = (id, successCallback, errorCallBack) => _fetchService(`regions/${id}`, 'DELETE', id, successCallback, errorCallBack);

// ////Loacations//
// export const LoactionShow = (data, successCallback, errorCallBack) => _fetchService('locations/getAllLocations', 'POST', data, successCallback, errorCallBack);

// export const LocationAdd = (data, successCallback, errorCallBack) => _fetchService('locations', 'POST', data, successCallback, errorCallBack);

// export const LocationUpdate = (data, successCallback, errorCallBack) => _fetchService(`locations/${data.id}`, 'POST', data, successCallback, errorCallBack);

// export const LocationDelete = (id, successCallback, errorCallBack) => _fetchService(`locations/${id}`, 'POST', id, successCallback, errorCallBack);

// ///Area///
// export const AreaAddShow = (data, successCallback, errorCallBack) => _fetchService('locations/getAllLocations', 'POST', data, successCallback, errorCallBack);

// export const AreShowList = (data, successCallback, errorCallBack) => _fetchService('areas/getAreasWithLocation', 'POST', data, successCallback, errorCallBack);

// export const AreaAdd = (data, successCallback, errorCallBack) => _fetchService('areas', 'POST', data, successCallback, errorCallBack);

// export const AreaUpdate = (data, successCallback, errorCallBack) => _fetchService(`areas/${data.id}`, 'UPDATE', data, successCallback, errorCallBack);

// export const AreaDelete = (id, successCallback, errorCallBack) => _fetchService(`area/${id}/delete`, 'DELETE', id, successCallback, errorCallBack);

// ///Building////
// export const BuildingAdd = (data, successCallback, errorCallBack) => _fetchService('buildings', 'POST', data, successCallback, errorCallBack);

// export const BuildingUpdate = (data, successCallback, errorCallBack) => _fetchService(`buildings/${data.id}`, 'UPDATE', data, successCallback, errorCallBack);

// export const BuildingDelete = (id, successCallback, errorCallBack) => _fetchService(`buildings/${id}`, 'DELETE', id, successCallback, errorCallBack);
