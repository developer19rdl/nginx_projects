import ApplicationStore from '../utils/localStorageUtil';

const successCaseCode = [200, 201];

const _fetchService = (PATH, serviceMethod, data, successCallback, errorCallBack) => {
    const { token, userDetails } = ApplicationStore().getStorage('userDetails');

    // CLIENT server
    // const END_POINT = 'http://125.18.47.138:8000/api/';

    // LOCAL
    const END_POINT = process.env.REACT_APP_EMS_API_URL;

    // const { companyCode } = userDetails;

    const headers = {


        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
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
            error.errorObject.then((errorResponse) => {
                if (error.errorStatus === 401 && errorResponse.message === 'Unable to access the page, Token Expired') {
                    ApplicationStore().clearStorage();
                    // location.reload();
                }
                errorCallBack(error.errorStatus, errorResponse.message);
            });
        });
};

export const FetchDisconnectedStatusService = (successCallback, errorCallBack) => _fetchService('MachineStatus/DisconnectedDeviceCount', 'GET', {}, successCallback, errorCallBack);
/////
export const FetchMachinesStatusService = (successCallback, errorCallBack) => _fetchService('MachineStatus', 'GET', {}, successCallback, errorCallBack);
export const EnergyconsumptionService = (successCallback, errorCallBack) => _fetchService('energy', 'GET', {}, successCallback, errorCallBack);
export const KwhEnergyService = (successCallback, errorCallBack) => _fetchService('energy/24HourEnergyTrend', 'GET', {}, successCallback, errorCallBack);
export const GetEnergyDataListService = (successCallback, errorCallBack, meterId) => _fetchService(`energy/kebData${meterId ? `?meterId=${meterId}` : ''}`, 'GET', {}, successCallback, errorCallBack);
export const GeneratorListService = (successCallback, errorCallBack) => _fetchService('energy/genratorData', 'GET', {}, successCallback, errorCallBack);
export const EnergyReportService = (data, successCallback, errorCallBack) => _fetchService('report/energyConsum', 'POST', data, successCallback, errorCallBack);
export const MachineListService = (successCallback, errorCallBack) => _fetchService('energy/meterDropDownList', 'GET', {}, successCallback, errorCallBack);
export const OeeDetails = (data, successCallback, errorCallBack) => _fetchService('oee/FetchActual', 'POST', data, successCallback, errorCallBack);
export const OeePlanedProduced = (data, successCallback, errorCallBack) => _fetchService('oee', 'POST', data, successCallback, errorCallBack);

export const MeterDataOnOffStatus = (successCallback, errorCallBack) => _fetchService('energy/meterDataOnOffStatus', 'GET', {}, successCallback, errorCallBack);
export const GetMeterOfflineThreshold = (successCallback, errorCallBack) => _fetchService('energy/meterOfflineThreshold', 'GET', {}, successCallback, errorCallBack);
export const UpdateMeterOfflineThreshold = (data, successCallback, errorCallBack) => _fetchService('energy/meterOfflineThreshold', 'PUT', data, successCallback, errorCallBack);

// ENERGY INSIDE KEB DASHBOARD
export const GetKEBCurrentData = (successCallback, errorCallBack, meterId) => _fetchService(`energy/kebCurrentData${meterId ? `?meterId=${meterId}` : ''}`, 'GET', {}, successCallback, errorCallBack);
export const GetTopFiveDevices = (successCallback, errorCallBack) => _fetchService('energy/topFiveDevices', 'GET', {}, successCallback, errorCallBack);
export const GetHourlyPowerByDevice = (successCallback, errorCallBack) => _fetchService('energy/hourlyPowerByDevice', 'GET', {}, successCallback, errorCallBack);
export const GetEnergyConsumption = (successCallback, errorCallBack, meterId) => _fetchService(`energy${meterId ? `?meterId=${meterId}` : ''}`, 'GET', {}, successCallback, errorCallBack);
export const GetEnergyConsumptionMonth = (successCallback, errorCallBack, meterId) => _fetchService(`energy/energyConsumptionMonth${meterId ? `?meterId=${meterId}` : ''}`, 'GET', {}, successCallback, errorCallBack);

// ENERGY PIE CHART
export const getTopFiveEnergyReport = (data, successCallback, errorCallBack) => _fetchService('report/top5energyData', 'POST', data, successCallback, errorCallBack);
export const getEnergyGraphReport = (data, successCallback, errorCallBack) => _fetchService('report/energydatagraph', 'POST', data, successCallback, errorCallBack);
export const getPlantDistributorFeeder = (data, successCallback, errorCallBack) => _fetchService('plants/reportPlantDropDown', 'POST', data, successCallback, errorCallBack);
export const getIncomerDropDown = (data, successCallback, errorCallBack) => _fetchService('plants/incomerDropDown', 'POST', data, successCallback, errorCallBack);

// BUILDING / CATEGORY HIERARCHY DROPDOWNS
export const getBuildingDropDown       = (successCallback, errorCallBack) => _fetchService('maincategory/buildingDropDown', 'GET', {}, successCallback, errorCallBack);
export const getFloorDropDown          = (data, successCallback, errorCallBack) => _fetchService('maincategory/floorDropDown', 'POST', data, successCallback, errorCallBack);
export const getCategoryDropDown       = (data, successCallback, errorCallBack) => _fetchService('maincategory/categoryDropDown', 'POST', data, successCallback, errorCallBack);
export const getSubCategoryDropDown    = (data, successCallback, errorCallBack) => _fetchService('subcategory/dropDown', 'POST', data, successCallback, errorCallBack);
export const getCategoryMeterDropDown  = (data, successCallback, errorCallBack) => _fetchService('maincategory/categoryMeterDropDown', 'POST', data, successCallback, errorCallBack);

// BUILDING ENERGY REPORT
export const BuildingEnergyReportService      = (data, successCallback, errorCallBack) => _fetchService('report/buildingEnergyConsum', 'POST', data, successCallback, errorCallBack);
export const BuildingEnergyHourReportService  = (data, successCallback, errorCallBack) => _fetchService('report/buildingEnergyHour', 'POST', data, successCallback, errorCallBack);
export const getBuildingTop5energyReport      = (data, successCallback, errorCallBack) => _fetchService('report/buildingTop5energyData', 'POST', data, successCallback, errorCallBack);
export const getBuildingEnergyGraphReport     = (data, successCallback, errorCallBack) => _fetchService('report/buildingEnergydatagraph', 'POST', data, successCallback, errorCallBack);

// PLANT
export const GetPlantTabLists = (successCallback, errorCallBack) => _fetchService('plants/PlantTabList', 'GET', {}, successCallback, errorCallBack);
export const GetSolarIncomerData = (successCallback, errorCallBack) => _fetchService('energy/solarData', 'GET', {}, successCallback, errorCallBack);
export const GetWindmillIncomerData = (successCallback, errorCallBack) => _fetchService('energy/WindmillData', 'GET', {}, successCallback, errorCallBack);

///Energy Hour///
export const EnergyHourReportService = (data, successCallback, errorCallBack) => _fetchService('report/EnergyHourReport', 'POST', data, successCallback, errorCallBack);

//ALERT REPORT
export const GetAlertReport = (data, successCallback, errorCallBack) => _fetchService('alert/showAlertReport', 'POST', data, successCallback, errorCallBack);
export const GetAlertDeviceDropdown = (successCallback, errorCallBack) => _fetchService('alert/deviceDropdown', 'GET', {}, successCallback, errorCallBack);
export const GetAlertSlaveDropdown = (data, successCallback, errorCallBack) => _fetchService(`alert/slaveDropdown?deviceId=${data.deviceId}`, 'GET', {}, successCallback, errorCallBack);
export const GetAlertTagDropdown = (data, successCallback, errorCallBack) => _fetchService(`alert/tagDropdown?deviceId=${data?.deviceId ?? 'all'}&slaveId=${data?.slaveId ?? 'all'}`, 'GET', {}, successCallback, errorCallBack);

// Active/uncleared alerts for one sensor dashboard (Temperature/Humidity/CO2/Pressure) — bell icon + modal.
export const GetDashboardAlerts = (data, successCallback, errorCallBack) => _fetchService(`alert/dashboardAlerts?sensorType=${encodeURIComponent(data.sensorType)}`, 'GET', {}, successCallback, errorCallBack);

// SENSOR REPORT
export const GetSensorReportDeviceDropdown = (successCallback, errorCallBack) => _fetchService('sensorReport/deviceDropdown', 'GET', {}, successCallback, errorCallBack);
export const GetSensorReportMeterDropdown = (successCallback, errorCallBack) => _fetchService('sensorReport/meterDropdown', 'GET', {}, successCallback, errorCallBack);
export const GetSensorReportSlaveDropdown = (data, successCallback, errorCallBack) => _fetchService(`sensorReport/slaveDropdown?deviceId=${data?.deviceId ?? 'all'}`, 'GET', {}, successCallback, errorCallBack);
export const GetSensorReportTagDropdown = (data, successCallback, errorCallBack) => _fetchService(`sensorReport/tagDropdown?deviceId=${data?.deviceId ?? 'all'}&slaveId=${data?.slaveId ?? 'all'}`, 'GET', {}, successCallback, errorCallBack);
export const GetSensorReportData = (data, successCallback, errorCallBack) => _fetchService('sensorReport/data', 'POST', data, successCallback, errorCallBack);
export const GetSensorReportExportData = (data, successCallback, errorCallBack) => _fetchService('sensorReport/export', 'POST', data, successCallback, errorCallBack);

//Environmental Hourly Report (Temperature/Humidity/CO2/Pressure, by Category)
export const GetEnvReportCategoryDropdown = (data, successCallback, errorCallBack) => _fetchService(`environmentalReport/categoryDropdown?sensorType=${encodeURIComponent(data?.sensorType || '')}`, 'GET', {}, successCallback, errorCallBack);
export const GetEnvReportData = (data, successCallback, errorCallBack) => _fetchService('environmentalReport/data', 'POST', data, successCallback, errorCallBack);
export const GetEnvReportExportData = (data, successCallback, errorCallBack) => _fetchService('environmentalReport/export', 'POST', data, successCallback, errorCallBack);

//REPORT/OEE
export const GetOeeMachineList = (successCallback, errorCallBack) => _fetchService('report/machineList', 'GET', {}, successCallback, errorCallBack);
export const GetOeeTableReport = (data, successCallback, errorCallBack) => _fetchService('oee/OeeReport', 'POST', data, successCallback, errorCallBack);

///Report Production
export const GetProductionTableReport = (data, successCallback, errorCallBack) => _fetchService('report/productionReport', 'POST', data, successCallback, errorCallBack);
export const GetOperatorList = (data, successCallback, errorCallBack) => _fetchService('operatorlog/showdropdown', 'POST', data, successCallback, errorCallBack);
export const GetProductionOperatorTableData = (data, successCallback, errorCallBack) => _fetchService('operatorlog/showproductionvalues', 'POST', data, successCallback, errorCallBack);

////Machine List///
export const FetchMachineListService = (successCallback, errorCallBack) => _fetchService('machineList', 'GET', {}, successCallback, errorCallBack);

///User List////
export const UserListService = (successCallback, errorCallBack) => _fetchService('user', 'GET', {}, successCallback, errorCallBack);
export const UserAddService = (data, successCallback, errorCallBack) => _fetchService('user', 'POST', data, successCallback, errorCallBack);
export const UserEditType = (data, successCallback, errorCallBack) => _fetchService(`user/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const UserDeleteService = (data, successCallback, errorCallBack) => _fetchService(`user/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

///Role List////
export const RoleListService = (successCallback, errorCallBack) => _fetchService('role', 'GET', {}, successCallback, errorCallBack);
export const RoleAddService = (data, successCallback, errorCallBack) => _fetchService('role', 'POST', data, successCallback, errorCallBack);
export const RoleEditService = (data, successCallback, errorCallBack) => _fetchService(`role/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const RoleDeleteService = (data, successCallback, errorCallBack) => _fetchService(`role/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

///Assign Role List////
export const AssignRoleListService = (successCallback, errorCallBack) => _fetchService('assignRole', 'GET', {}, successCallback, errorCallBack);
export const AssignRoleByRoleNameService = (roleName, successCallback, errorCallBack) => _fetchService(`assignRole/byRole/${roleName}`, 'GET', {}, successCallback, errorCallBack);
export const AssignRoleAddService = (data, successCallback, errorCallBack) => _fetchService('assignRole', 'POST', data, successCallback, errorCallBack);
export const AssignRoleEditService = (data, successCallback, errorCallBack) => _fetchService(`assignRole/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const AssignRoleDeleteService = (data, successCallback, errorCallBack) => _fetchService(`assignRole/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

//DEPARTMENT///
export const DepartmentList = (successCallback, errorCallBack) => _fetchService('Department', 'GET', {}, successCallback, errorCallBack);

/////OPERATOR/////////
export const OperatortList = (successCallback, errorCallBack) => _fetchService('Operator', 'GET', {}, successCallback, errorCallBack);
export const OperatortAddService = (data, successCallback, errorCallBack) => _fetchService('Operator', 'POST', data, successCallback, errorCallBack);
export const OperatortEditType = (data, successCallback, errorCallBack) => _fetchService(`Operator/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const OperatortDeleteType = (data, successCallback, errorCallBack) => _fetchService(`Operator/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

//ENERGY MONITORING PLANT SERVICES
// export const GetMeterDataListService = (successCallback, errorCallBack) => _fetchService('energy/energyMeterDataList', 'GET', {}, successCallback, errorCallBack);
export const GetMeterDataListService = (data, successCallback, errorCallBack) => _fetchService('energy/energyMeterDataList', 'POST', data, successCallback, errorCallBack);
export const GetMainIncomerDistSubDist = (successCallback, errorCallBack) => _fetchService('energy/mainIncomer', 'GET', {}, successCallback, errorCallBack);
export const GetPlantDistributorData = (data, successCallback, errorCallBack) => _fetchService('energy/plantDistributerData', 'POST', data, successCallback, errorCallBack);
export const GetDistributerLastMonth = (data, successCallback, errorCallBack) => _fetchService('energy/lastMonthDistributerTrend', 'POST', data, successCallback, errorCallBack);
export const GetDistributerPerHour = (data, successCallback, errorCallBack) => _fetchService('energy/24HourDistributerTrend', 'POST', data, successCallback, errorCallBack);

/////Load Shedule////
export const AddLaodSheduling = (data, successCallback, errorCallBack) => _fetchService('AssignShift/importAssignShift', 'POST', data, successCallback, errorCallBack);
export const UpdateLoadSchedule = (data, successCallback, errorCallBack) => _fetchService(`shifts/rescheduleedit/${data.id}`, 'PUT', data, successCallback, errorCallBack);

//////Repryt MAchine List///
export const allocMachinesList = (successCallback, errorCallBack) => _fetchService('report/allocMachineList', 'GET', {}, successCallback, errorCallBack);

///////OPERATOR LOG////
export const OperatorLogDropDown = (data, successCallback, errorCallBack) => _fetchService('operatorlog/showdropdown', 'POST', data, successCallback, errorCallBack);
export const AddOpearatorLog = (data, successCallback, errorCallBack) => _fetchService('operatorlog/show', 'POST', data, successCallback, errorCallBack);

// MACHINE HEALTH DASHBOARD CARD
export const HealthDashboardMachineList = (successCallback, errorCallBack) => _fetchService('machineList/healthDashboard', 'GET', {}, successCallback, errorCallBack);

// MACHINE HEALTH INNER CARD SENSOR DROPDOWN
export const GetMachineHeaderData = (data, successCallback, errorCallBack) => _fetchService('Sensors_settongs/show', 'POST', data, successCallback, errorCallBack);
export const GetHeaderDropdown1 = (data, successCallback, errorCallBack) => _fetchService('sensors/showSelectAllDropdownValues', 'POST', data, successCallback, errorCallBack);
export const GetHeaderDropdown2 = (data, successCallback, errorCallBack) => _fetchService('sensors/showSelectAllDropdownValues', 'POST', data, successCallback, errorCallBack);
export const GetHeaderDropdown3 = (data, successCallback, errorCallBack) => _fetchService('sensors/showSelectAllDropdownValues', 'POST', data, successCallback, errorCallBack);
export const UpdateMachineHeaderData = (data, successCallback, errorCallBack) => _fetchService(`Sensors_settongs/${data.machineId}`, 'PUT', data, successCallback, errorCallBack);
export const GetSelectDropdown = (data, successCallback, errorCallBack) => _fetchService('sensors/showSelectAllDropdownValues', 'POST', data, successCallback, errorCallBack);
export const GetSelectDropdown1 = (data, successCallback, errorCallBack) => _fetchService('sensors/showSelectAllDropdownValues', 'POST', data, successCallback, errorCallBack);
export const GetSelectDropdown2 = (data, successCallback, errorCallBack) => _fetchService('sensors/showSelectAllDropdownValues', 'POST', data, successCallback, errorCallBack);
export const GetSelectDropdown3 = (data, successCallback, errorCallBack) => _fetchService('sensors/showSelectAllDropdownValues', 'POST', data, successCallback, errorCallBack);
export const GetSensorDropdown = (data, successCallback, errorCallBack) => _fetchService('sensors/showdropdown', 'POST', data, successCallback, errorCallBack);
export const UpdateSensorDropdown = (data, successCallback, errorCallBack) => _fetchService('sensors/showupdatedropdown', 'POST', data, successCallback, errorCallBack);
export const GetChartData = (data, successCallback, errorCallBack) => _fetchService('sensors/ChartData', 'POST', data, successCallback, errorCallBack);
export const GetChartTwoData = (data, successCallback, errorCallBack) => _fetchService('sensors/ChartData2', 'POST', data, successCallback, errorCallBack);
export const GetChartThreeData = (data, successCallback, errorCallBack) => _fetchService('sensors/ChartData3', 'POST', data, successCallback, errorCallBack);
export const GetAlertData = (data, successCallback, errorCallBack) => _fetchService('Sensors_settongs/showgrid', 'POST', data, successCallback, errorCallBack);
export const ClearAlertData = (data, successCallback, errorCallBack) => _fetchService(`Sensors_settongs/clearAlert/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const UpdateGraphDisplayName = (data, successCallback, errorCallBack) => _fetchService('Sensors_settongs/updateDisplayName', 'PUT', data, successCallback, errorCallBack);
export const GetSlaveIdDropdown = (data, successCallback, errorCallBack) => _fetchService('sensors/showSlave', 'POST', data, successCallback, errorCallBack);
export const GetHeaderSlaveIdDropdown = (data, successCallback, errorCallBack) => _fetchService('sensors/showDashBoardSlave', 'POST', data, successCallback, errorCallBack);
export const UpdateSlaveIdDropdown = (data, successCallback, errorCallBack) => _fetchService('Sensors_settongs/updateSlaveId', 'PUT', data, successCallback, errorCallBack);


// MAIN DASHBOARD INNER CARD API
export const GetDownTimeTrends = (data, successCallback, errorCallBack) => _fetchService('oee/downTimeTrends', 'POST', data, successCallback, errorCallBack);
export const GetCalenderDetails = (data, successCallback, errorCallBack) => _fetchService(`MainteSchd/showcalendar/${data.machineId}`, 'GET', data, successCallback, errorCallBack);
export const GetCapacityUtilizationData = (data, successCallback, errorCallBack) => _fetchService('oee', 'POST', data, successCallback, errorCallBack);

//SCHEDULE MODULE
export const GetScheduledList = (successCallback, errorCallBack) => _fetchService('shifts/show', 'GET', {}, successCallback, errorCallBack);
export const ImportUpdatedScheduleList = (data, successCallback, errorCallBack) => _fetchService('shifts/importAssignShift', 'POST', data, successCallback, errorCallBack);
export const ImportReScheduleList = (data, successCallback, errorCallBack) => _fetchService('shifts/rescheduleupdate', 'POST', data, successCallback, errorCallBack);



// ---------------------------------VISHNU CHANGES-----------------------------------

/////----------Add Asset--------/////
export const AssetShowdata = (successCallback, errorCallBack) => _fetchService(`Asset/`, 'GET', {}, successCallback, errorCallBack);
export const AssetAdd = (data, successCallback, errorCallBack) => _fetchService('Asset/', 'POST', data, successCallback, errorCallBack);
export const AssetUpdate = (data, successCallback, errorCallBack) => _fetchService(`Asset/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const AssetDelete = (data, successCallback, errorCallBack) => _fetchService(`Asset/${data}`, 'DELETE', data, successCallback, errorCallBack);
export const insertAlertIntoDatabase = (data, successCallback, errorCallBack) => _fetchService('PrevMaint/store', 'POST', data, successCallback, errorCallBack);
export const AssetUpload = (data, successCallback, errorCallBack) => _fetchService('Asset/importAssetTable', 'POST', data, successCallback, errorCallBack);


/////----------Asset Department--------/////
export const DepartmentShowdata = (successCallback, errorCallBack) => _fetchService(`Department`, 'GET', {}, successCallback, errorCallBack);
export const DepartmentAdd = (data, successCallback, errorCallBack) => _fetchService('Department/', 'POST', data, successCallback, errorCallBack);
export const DepartmentUpdate = (data, successCallback, errorCallBack) => _fetchService(`Department/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const DepartmentDelete = (data, successCallback, errorCallBack) => _fetchService(`Department/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

/////----------Add Vendor--------/////
export const VendorShowdata = (successCallback, errorCallBack) => _fetchService(`Vendor/`, 'GET', {}, successCallback, errorCallBack);
export const VendorAdd = (data, successCallback, errorCallBack) => _fetchService('Vendor/', 'POST', data, successCallback, errorCallBack);
export const VendorUpdate = (data, successCallback, errorCallBack) => _fetchService(`Vendor/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const VendorDelete = (data, successCallback, errorCallBack) => _fetchService(`Vendor/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

/////----------Asset Type--------/////
export const AssetTypeShowdata = (successCallback, errorCallBack) => _fetchService(`Assettype `, 'GET', {}, successCallback, errorCallBack);
export const AssetTypeAdd = (data, successCallback, errorCallBack) => _fetchService('Assettype', 'POST', data, successCallback, errorCallBack);
export const AssetTypeUpdate = (data, successCallback, errorCallBack) => _fetchService(`Assettype/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const AssetTypeDelete = (data, successCallback, errorCallBack) => _fetchService(`Assettype/${data.id}`, 'DELETE', data, successCallback, errorCallBack);
export const FetchAssetTypeSec = (data, successCallback, errorCallBack) => _fetchService(`Assettype/showsection/${data.id}`, 'GET', {}, successCallback, errorCallBack);

/////----------Master Asset--------/////
export const FetchDeptAsset = (data, successCallback, errorCallBack) => _fetchService(`MstList`, 'GET', {}, successCallback, errorCallBack);
export const FetchSectionAsset = (data, successCallback, errorCallBack) => _fetchService(`MstList/section/${data.id}`, 'GET', {}, successCallback, errorCallBack);
export const FetchAsstTypeAsset = (data, successCallback, errorCallBack) => _fetchService(`MstList/AssetType/${data.id}`, 'GET', {}, successCallback, errorCallBack);
export const FetchassetData = (data, successCallback, errorCallBack) => _fetchService('MstList/Assetdata', 'POST', data, successCallback, errorCallBack);

/////----------Asset Section--------/////
export const SectionShowdata = (successCallback, errorCallBack) => _fetchService(`Section`, 'GET', {}, successCallback, errorCallBack);
export const SectionAdd = (data, successCallback, errorCallBack) => _fetchService('Section', 'POST', data, successCallback, errorCallBack);
export const SectionUpdate = (data, successCallback, errorCallBack) => _fetchService(`Section/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const SectionDelete = (data, successCallback, errorCallBack) => _fetchService(`Section/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

/////----------Asset Group--------/////
export const AssetGroupShowdata = (successCallback, errorCallBack) => _fetchService(`AssetGroup`, 'GET', {}, successCallback, errorCallBack);
export const AssetGroupAdd = (data, successCallback, errorCallBack) => _fetchService('AssetGroup/', 'POST', data, successCallback, errorCallBack);
export const AssetGroupUpdate = (data, successCallback, errorCallBack) => _fetchService(`AssetGroup/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const AssetGroupDelete = (data, successCallback, errorCallBack) => _fetchService(`AssetGroup/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

//////------- Transfer----/////
export const FetchAsstNameAsset = (data, successCallback, errorCallBack) => _fetchService(`Transfer/AssetName/${data.id}`, 'GET', {}, successCallback, errorCallBack);
export const AssetTransferData = (data, successCallback, errorCallBack) => _fetchService('Transfer/moveAsset', 'POST', data, successCallback, errorCallBack);

////------AMC------/////
export const AmcShowdata = (successCallback, errorCallBack) => _fetchService(`AmcAdd`, 'GET', {}, successCallback, errorCallBack);
export const AmcAdd = (data, successCallback, errorCallBack) => _fetchService('AmcAdd/', 'POST', data, successCallback, errorCallBack);
export const AmcUpdate = (data, successCallback, errorCallBack) => _fetchService(`AmcAdd/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const AmcDelete = (data, successCallback, errorCallBack) => _fetchService(`AmcAdd/${data}`, 'DELETE', data, successCallback, errorCallBack);

////-----Service Due-----/////
export const ServiceDueView = (data, successCallback, errorCallBack) => _fetchService('ServiceDueApi/showDatabydate', 'POST', data, successCallback, errorCallBack);

////-----AMC Renewal---////
export const AmcRenewalView = (successCallback, errorCallBack) => _fetchService(`ServiceDueApi/showRenewalData`, 'GET', {}, successCallback, errorCallBack);
export const AmcRenewalViewData = (successCallback, errorCallBack) => _fetchService(`ServiceDueApi/showRenewalData`, 'GET', {}, successCallback, errorCallBack);
export const AmcRenewalUpdate = (data, successCallback, errorCallBack) => _fetchService(`ServiceDueApi/showRenewalDataById/${data.id}`, 'PUT', data, successCallback, errorCallBack);

////----Certificate---///
export const CertificateShowdata = (successCallback, errorCallBack) => _fetchService(`Certificate`, 'GET', {}, successCallback, errorCallBack);
export const CertificateAdd = (data, successCallback, errorCallBack) => _fetchService('Certificate/store', 'POST', data, successCallback, errorCallBack);
export const CertificateUpdate = (data, successCallback, errorCallBack) => _fetchService(`Certificate/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const CertificateDelete = (data, successCallback, errorCallBack) => _fetchService(`Certificate/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

////------Certificate Due----////
export const CertificateDueView = (data, successCallback, errorCallBack) => _fetchService('Certificate/showDatabydate ', 'POST', data, successCallback, errorCallBack);
export const Certificaterenewaldata = (successCallback, errorCallBack) => _fetchService(`Certificate/showrenewal `, 'GET', {}, successCallback, errorCallBack);

///////////  Warranty /////////
export const Warrentyview = (data, successCallback, errorCallBack) => _fetchService('Warranty', 'POST', data, successCallback, errorCallBack);

// unit Master
export const UnitAdd = (data, successCallback, errorCallBack) => _fetchService(`UnitMaster`, 'POST', data, successCallback, errorCallBack);
export const UnitAddView = (successCallback, errorCallBack) => _fetchService(`UnitMaster`, 'GET', {}, successCallback, errorCallBack);
export const UnitAddUpdate = (data, successCallback, errorCallBack) => _fetchService(`UnitMaster/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const UnittDalete = (data, successCallback, errorCallBack) => _fetchService(`UnitMaster/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

// OEEParameters
export const OEEParameters = (data, successCallback, errorCallBack) => _fetchService(`OEEParameters`, 'POST', data, successCallback, errorCallBack);
export const OEEParametersView = (successCallback, errorCallBack) => _fetchService(`OEEParameters`, 'GET', {}, successCallback, errorCallBack);
export const OEEParametersUpdate = (data, successCallback, errorCallBack) => _fetchService(`OEEParameters/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const OEEParametersDalete = (data, successCallback, errorCallBack) => _fetchService(`OEEParameters/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

// CapacityMeasureAdd Master
export const CapacityMeasureAdd = (data, successCallback, errorCallBack) => _fetchService(`CapacityMeasure`, 'POST', data, successCallback, errorCallBack);
export const CapacityMeasureView = (successCallback, errorCallBack) => _fetchService(`CapacityMeasure`, 'GET', {}, successCallback, errorCallBack);
export const CapacityMeasureUpdate = (data, successCallback, errorCallBack) => _fetchService(`CapacityMeasure/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const CapacityMeasureDalete = (data, successCallback, errorCallBack) => _fetchService(`CapacityMeasure/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

// Department
export const Department = (data, successCallback, errorCallBack) => _fetchService(`DepartmentOperation`, 'POST', data, successCallback, errorCallBack);
export const DepartmentView = (successCallback, errorCallBack) => _fetchService(`DepartmentOperation`, 'GET', {}, successCallback, errorCallBack);
export const DepartmentUpdateOperation = (data, successCallback, errorCallBack) => _fetchService(`DepartmentOperation/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const DepartmentDalete = (data, successCallback, errorCallBack) => _fetchService(`DepartmentOperation/${data}`, 'DELETE', data, successCallback, errorCallBack);

// Machine
export const Machine = (data, successCallback, errorCallBack) => _fetchService(`Machine`, 'POST', data, successCallback, errorCallBack);
export const MachineView = (successCallback, errorCallBack) => _fetchService(`Machine`, 'GET', {}, successCallback, errorCallBack);
export const MachineUpdate = (data, successCallback, errorCallBack) => _fetchService(`Machine/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const MachineDalete = (data, successCallback, errorCallBack) => _fetchService(`Machine/${data.id}`, 'DELETE', data, successCallback, errorCallBack);
export const showMachineView = (data, successCallback, errorCallBack) => _fetchService(`Machine/machine/${data.id}`, 'POST', data, successCallback, errorCallBack);

// ScheduleEvent
export const ScheduleEvent = (data, successCallback, errorCallBack) => _fetchService(`ScheduleEvent`, 'POST', data, successCallback, errorCallBack);
export const ScheduleEventView = (successCallback, errorCallBack) => _fetchService(`ScheduleEvent`, 'GET', {}, successCallback, errorCallBack);
export const ScheduleEventUpdate = (data, successCallback, errorCallBack) => _fetchService(`ScheduleEvent/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const ScheduleEventDalete = (data, successCallback, errorCallBack) => _fetchService(`ScheduleEvent/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

// AddEvent
export const AddEvent = (data, successCallback, errorCallBack) => _fetchService(`AddEvent`, 'POST', data, successCallback, errorCallBack);
export const AddEventView = (successCallback, errorCallBack) => _fetchService(`AddEvent`, 'GET', {}, successCallback, errorCallBack);
export const AddEventUpdate = (data, successCallback, errorCallBack) => _fetchService(`AddEvent/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const AddEventDalete = (data, successCallback, errorCallBack) => _fetchService(`AddEvent/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

// AddMaxEnergy
export const AddMaxEnergy = (data, successCallback, errorCallBack) => _fetchService(`AddMaxEnergy`, 'POST', data, successCallback, errorCallBack);
export const AddMaxEnergyView = (successCallback, errorCallBack) => _fetchService(`AddMaxEnergy`, 'GET', {}, successCallback, errorCallBack);
export const AddMaxEnergyUpdate = (data, successCallback, errorCallBack) => _fetchService(`AddMaxEnergy/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const AddMaxEnergyDalete = (data, successCallback, errorCallBack) => _fetchService(`AddMaxEnergy/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

// EnergyTariff
export const AddEnergyTariff = (data, successCallback, errorCallBack) => _fetchService(`EnergyTariff`, 'POST', data, successCallback, errorCallBack);
export const EnergyTariffView = (successCallback, errorCallBack) => _fetchService(`EnergyTariff`, 'GET', {}, successCallback, errorCallBack);
export const EnergyTariffUpdate = (data, successCallback, errorCallBack) => _fetchService(`EnergyTariff/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const EnergyTariffDelete = (data, successCallback, errorCallBack) => _fetchService(`EnergyTariff/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

// ServerUsageThresholds
export const ServerUsageThresholds = (data, successCallback, errorCallBack) => _fetchService(`ServerUsageThresholds`, 'POST', data, successCallback, errorCallBack);
export const ServerUsageThresholdsView = (successCallback, errorCallBack) => _fetchService(`ServerUsageThresholds`, 'GET', {}, successCallback, errorCallBack);
export const ServerUsageThresholdsUpdate = (data, successCallback, errorCallBack) => _fetchService(`ServerUsageThresholds/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const ServerUsageThresholdsDalete = (data, successCallback, errorCallBack) => _fetchService(`ServerUsageThresholds/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

// AddTools
export const AddTools = (data, successCallback, errorCallBack) => _fetchService(`AddTools`, 'POST', data, successCallback, errorCallBack);
export const AddToolsView = (successCallback, errorCallBack) => _fetchService(`AddTools`, 'GET', {}, successCallback, errorCallBack);
export const AddToolsUpdate = (data, successCallback, errorCallBack) => _fetchService(`AddTools/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const AddToolsDalete = (data, successCallback, errorCallBack) => _fetchService(`AddTools/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

export const AddToolsMachineView = (successCallback, errorCallBack) => _fetchService(`Machine/showmachinename`, 'GET', {}, successCallback, errorCallBack);

// AddSensorconfi
export const AddSensorconfi = (data, successCallback, errorCallBack) => _fetchService(`AddSensorconfi`, 'POST', data, successCallback, errorCallBack);
export const AddSensorconfiView = (successCallback, errorCallBack) => _fetchService(`AddSensorconfi`, 'GET', {}, successCallback, errorCallBack);
export const AddSensorconfiUpdate = (data, successCallback, errorCallBack) => _fetchService(`AddSensorconfi/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const AddSensorconfiDalete = (data, successCallback, errorCallBack) => _fetchService(`AddSensorconfi/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

// Setalert
export const SetalertAdd = (data, successCallback, errorCallBack) => _fetchService(`Setalert`, 'POST', data, successCallback, errorCallBack);
export const SetalertShowdata = (successCallback, errorCallBack) => _fetchService(`Setalert`, 'GET', {}, successCallback, errorCallBack);
export const SetalertUpdate = (data, successCallback, errorCallBack) => _fetchService(`Setalert/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const SetAlertDelete = (data, successCallback, errorCallBack) => _fetchService(`Setalert/${data.id}`, 'DELETE', data, successCallback, errorCallBack);
export const SetalertMachineView = (successCallback, errorCallBack) => _fetchService(`Machine/showmachinename`, 'GET', {}, successCallback, errorCallBack);
export const SelectMachineAlert = (successCallback, errorCallBack) => _fetchService(`machineList/MachineName`, 'GET', {}, successCallback, errorCallBack);
export const SelectSensorClassAlert = (successCallback, errorCallBack) => _fetchService(`Setalert/sensorname`, 'GET', {}, successCallback, errorCallBack);
export const selectConsumableName = (successCallback, errorCallBack) => _fetchService(`SetConsumable/showname`, 'GET', {}, successCallback, errorCallBack);

// SetConsumable
export const SetConsumableAdd = (data, successCallback, errorCallBack) => _fetchService(`SetConsumable`, 'POST', data, successCallback, errorCallBack);
export const SetConsumableShowdata = (successCallback, errorCallBack) => _fetchService(`SetConsumable`, 'GET', {}, successCallback, errorCallBack);
export const SetConsumableUpdate = (data, successCallback, errorCallBack) => _fetchService(`SetConsumable/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const SetConsumableDelete = (data, successCallback, errorCallBack) => _fetchService(`SetConsumable/${data.id}`, 'DELETE', data, successCallback, errorCallBack);
export const selectcounsuName = (data, successCallback, errorCallBack) => _fetchService(`SetConsumable/name/${data.id}`, 'POST', data, successCallback, errorCallBack);

// FailuremetricTarget
export const FailuremetricAdd = (data, successCallback, errorCallBack) => _fetchService(`FailuremetricTarget`, 'POST', data, successCallback, errorCallBack);
export const FailuremetricShowdata = (successCallback, errorCallBack) => _fetchService(`FailuremetricTarget`, 'GET', {}, successCallback, errorCallBack);
export const FailuremetricUpdate = (data, successCallback, errorCallBack) => _fetchService(`FailuremetricTarget/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const FailuremetricDelete = (data, successCallback, errorCallBack) => _fetchService(`FailuremetricTarget/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

// ///////////////////////////////////  Maintenance Schedule   ///////////
export const insertMaintenanceSchedule = (data, successCallback, errorCallBack) => _fetchService('MainteSchd/storeData', 'POST', data, successCallback, errorCallBack);
export const MaintenanceShudeleName = (successCallback, errorCallBack) => _fetchService('MainteSchd/showAssetName', 'GET', {}, successCallback, errorCallBack);
export const GetAffectedMachine = (successCallback, errorCallBack) => _fetchService('MainteSchd/showallmachines', 'GET', {}, successCallback, errorCallBack);
export const viewwarrentyStatus = (data, successCallback, errorCallBack) => _fetchService(`MainteSchd/showWarrenty/${data.id}`, 'POST', data, successCallback, errorCallBack);
export const MaintenanceshowUser = (successCallback, errorCallBack) => _fetchService('MainteSchd/showUser', 'GET', {}, successCallback, errorCallBack);
export const showOperators = (successCallback, errorCallBack) => _fetchService('Operator/', 'GET', {}, successCallback, errorCallBack);

/////----------Nature Category--------/////
export const NatureShowdata = (successCallback, errorCallBack) => _fetchService(`Natureprob`, 'GET', {}, successCallback, errorCallBack);
export const NatureAdd = (data, successCallback, errorCallBack) => _fetchService('Natureprob', 'POST', data, successCallback, errorCallBack);
export const NatureUpdate = (data, successCallback, errorCallBack) => _fetchService(`Natureprob/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const NatureDelete = (data, successCallback, errorCallBack) => _fetchService(`Natureprob/${data.id}`, 'DELETE', data, successCallback, errorCallBack);
export const Natureshowbyid = (data, successCallback, errorCallBack) => _fetchService(`Natureprob/${data.id}`, 'POST', data, successCallback, errorCallBack);

/////----------Problem Category--------/////
export const ProblemShowdata = (successCallback, errorCallBack) => _fetchService(`Category`, 'GET', {}, successCallback, errorCallBack);
export const ProblemAdd = (data, successCallback, errorCallBack) => _fetchService('Category', 'POST', data, successCallback, errorCallBack);
export const ProblemUpdate = (data, successCallback, errorCallBack) => _fetchService(`Category/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const ProblemDelete = (data, successCallback, errorCallBack) => _fetchService(`Category/${data}`, 'DELETE', data, successCallback, errorCallBack);


///////////  Warranty /////////
// export const Warrentyview = (data, successCallback, errorCallBack) => _fetchService('Warranty', 'POST', data, successCallback, errorCallBack);

// ///////////////////////////////////  MaintenanceAproval  ///////////
export const MaintenanceAprovalshow = (successCallback, errorCallBack) => _fetchService('MainteAppro/showpending', 'GET', {}, successCallback, errorCallBack);
export const MaintenanceApproved = (successCallback, errorCallBack) => _fetchService('MainteAppro/show', 'GET', {}, successCallback, errorCallBack);
export const Maintenanceshowreject = (successCallback, errorCallBack) => _fetchService('MainteAppro/showreject', 'GET', {}, successCallback, errorCallBack);
export const MaintenenceAproveReject = (data, successCallback, errorCallBack) => _fetchService(`MainteAppro/approve/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const MaintenanceshowCompleted = (successCallback, errorCallBack) => _fetchService('MainteAppro/showcomp', 'GET', {}, successCallback, errorCallBack);
export const MaintenanceUpdate = (data, successCallback, errorCallBack) => _fetchService('MainteAppro/storeandupdate', 'POST', data, successCallback, errorCallBack);

// ///////////////////////////////////////   Maintenance Status    ///////////////////////////////////////////
export const showMaintanceDatabyiD = (data, successCallback, errorCallBack) => _fetchService(`MainteSchd/showDataType/${data.id}`, 'GET', {}, successCallback, errorCallBack);

///////////    Preventive Maintance Schedule    //////////////
export const PreventiveMaintanceSchedule = (successCallback, errorCallBack) => _fetchService(`MainteAppro/show `, 'GET', {}, successCallback, errorCallBack);
export const shopFloreSchedule = (successCallback, errorCallBack) => _fetchService('PrevMaint/deviceAlertCounts', 'GET', {}, successCallback, errorCallBack);
export const shopFloregraphdata = (successCallback, errorCallBack) => _fetchService('PrevMaint/showshopflore', 'GET', {}, successCallback, errorCallBack);
export const PreveMaintainancecount = (data, successCallback, errorCallBack) => _fetchService('PrevMaint/showApprove', 'POST', data, successCallback, errorCallBack);
export const showdeviceCount = (successCallback, errorCallBack) => _fetchService('Asset/showcount', 'GET', {}, successCallback, errorCallBack);

///////////    Machine   //////////////
export const showmachine = (successCallback, errorCallBack) => _fetchService('machineList/MachineName', 'GET', {}, successCallback, errorCallBack);

// alert ///////
export const showalert = (successCallback, errorCallBack) => _fetchService('AlertData/showalert', 'GET', {}, successCallback, errorCallBack);

// MachineParaAllocationTab
export const MachineDeviceCategory = (data, successCallback, errorCallBack) => _fetchService(`DeviceCategory`, 'POST', data, successCallback, errorCallBack);
export const MachineDeviceCategoryView = (successCallback, errorCallBack) => _fetchService(`DeviceCategory`, 'GET', {}, successCallback, errorCallBack);
export const MachineDeviceCategoredit = (data, successCallback, errorCallBack) => _fetchService(`DeviceCategory/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const MachineDeviceCategoredelete = (data, successCallback, errorCallBack) => _fetchService(`DeviceCategory/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

// SensorCategory
export const SensorCategoryAdd = (data, successCallback, errorCallBack) => _fetchService(`SensorCategory`, 'POST', data, successCallback, errorCallBack);
export const SensorCategoryView = (successCallback, errorCallBack) => _fetchService(`SensorCategory`, 'GET', {}, successCallback, errorCallBack);
export const SensorCategoryViewedit = (data, successCallback, errorCallBack) => _fetchService(`SensorCategory/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const SensorCategoryViewdelete = (data, successCallback, errorCallBack) => _fetchService(`SensorCategory/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

// AddSensor
export const AddSensorAdd = (data, successCallback, errorCallBack) => _fetchService(`AddSensor`, 'POST', data, successCallback, errorCallBack);
export const AddSensorView = (successCallback, errorCallBack) => _fetchService(`AddSensor`, 'GET', {}, successCallback, errorCallBack);
export const AddSensorViewedit = (data, successCallback, errorCallBack) => _fetchService(`AddSensor/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const AddSensorViewdelete = (data, successCallback, errorCallBack) => _fetchService(`AddSensor/${data.id}`, 'DELETE', data, successCallback, errorCallBack);
export const AddSensorViewname = (successCallback, errorCallBack) => _fetchService(`SensorCategory/name`, 'GET', {}, successCallback, errorCallBack);

// Edge device
export const EdgeDeviceAdd = (data, successCallback, errorCallBack) => _fetchService(`EdgeDevice`, 'POST', data, successCallback, errorCallBack);
export const EdgeDeviceName = (data, successCallback, errorCallBack) => _fetchService(`EdgeDevice/${data.id}`, 'POST', data, successCallback, errorCallBack);
export const EdgeDeviceView = (successCallback, errorCallBack) => _fetchService(`EdgeDevice`, 'GET', {}, successCallback, errorCallBack);
export const EdgeDevicename = (successCallback, errorCallBack) => _fetchService(`EdgeDevice/devicename`, 'GET', {}, successCallback, errorCallBack);
export const slaveId = (data, successCallback, errorCallBack) => _fetchService(`MachineAllocation/showslaveId/${data.id}`, 'POST', data, successCallback, errorCallBack);
export const EdgeDeviceViewedit = (data, successCallback, errorCallBack) => _fetchService(`EdgeDevice/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const EdgeDeviceViewdelete = (data, successCallback, errorCallBack) => _fetchService(`EdgeDevice/${data.id}`, 'DELETE', data, successCallback, errorCallBack);
export const EdgeDeviceViewname = (successCallback, errorCallBack) => _fetchService(`SensorCategory/name`, 'GET', {}, successCallback, errorCallBack);

// Edge device
export const TagAddAdd = (data, successCallback, errorCallBack) => _fetchService(`TagAdd`, 'POST', data, successCallback, errorCallBack);
export const TagAddView = (successCallback, errorCallBack) => _fetchService(`TagAdd`, 'GET', {}, successCallback, errorCallBack);
export const TagAddViewedit = (data, successCallback, errorCallBack) => _fetchService(`TagAdd/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const TagAddViewdelete = (data, successCallback, errorCallBack) => _fetchService(`TagAdd/${data.id}`, 'DELETE', data, successCallback, errorCallBack);
export const TagAddViewname = (successCallback, errorCallBack) => _fetchService(`SensorCategory/name`, 'GET', {}, successCallback, errorCallBack);
export const TagAddAddexcel = (data, successCallback, errorCallBack) => _fetchService(`TagAdd/excel`, 'POST', data, successCallback, errorCallBack);
export const TagName = (data, successCallback, errorCallBack) => _fetchService(`TagAdd/Tagname`, 'POST', data, successCallback, errorCallBack);

// MeterAllocation
export const MeterAllocationAdd = (data, successCallback, errorCallBack) => _fetchService(`MeterAllocation`, 'POST', data, successCallback, errorCallBack);
export const MeterAllocationView = (successCallback, errorCallBack) => _fetchService(`MeterAllocation`, 'GET', {}, successCallback, errorCallBack);
export const MeterAllocationViewedit = (data, successCallback, errorCallBack) => _fetchService(`MeterAllocation/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const MeterAllocationViewdelete = (data, successCallback, errorCallBack) => _fetchService(`MeterAllocation/${data.id}`, 'DELETE', data, successCallback, errorCallBack);
export const MeterAllocationdeviceName = (successCallback, errorCallBack) => _fetchService(`MeterAllocation/devicename`, 'GET', {}, successCallback, errorCallBack);
export const MeterSlaveID = (data, successCallback, errorCallBack) => _fetchService(`MeterAllocation/slavename/${data.id}`, 'POST', data, successCallback, errorCallBack);
export const MeterAddexcel = (data, successCallback, errorCallBack) => _fetchService(`MeterAllocation/excel`, 'POST', data, successCallback, errorCallBack);
export const getDeviceSlaveId = (data, successCallback, errorCallBack) => _fetchService('MeterAllocation/slaveIdList', 'POST', data, successCallback, errorCallBack);
export const MeterPlantAdd = (data, successCallback, errorCallBack) => _fetchService(`plants`, 'POST', data, successCallback, errorCallBack);
export const MeterPlantShow = (successCallback, errorCallBack) => _fetchService(`plants`, 'GET', {}, successCallback, errorCallBack);
export const MeterPlantEdit = (data, successCallback, errorCallBack) => _fetchService(`plants/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const MeterPlantDelete = (data, successCallback, errorCallBack) => _fetchService(`plants/${data.id}`, 'DELETE', data, successCallback, errorCallBack);
export const MeterPlantDropdown = (successCallback, errorCallBack) => _fetchService(`plants/dropDown`, 'GET', {}, successCallback, errorCallBack);
export const GetIncomer = (data, successCallback, errorCallBack) => _fetchService(`incomer/dropDown/${data.plantId}`, 'GET', {}, successCallback, errorCallBack);
export const MeterFederDropdown = (data, successCallback, errorCallBack) => _fetchService(`plants/feederList?plantId=${data?.plantId}`, 'GET', data, successCallback, errorCallBack);


// MachineAllocation
export const MachineAllocationAdd = (data, successCallback, errorCallBack) => _fetchService(`MachineAllocation`, 'POST', data, successCallback, errorCallBack);
export const MachineAllocationView = (successCallback, errorCallBack) => _fetchService(`MachineAllocation`, 'GET', {}, successCallback, errorCallBack);
export const MachineAllocationViewedit = (data, successCallback, errorCallBack) => _fetchService(`MachineAllocation/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const MachineAllocationViewdelete = (data, successCallback, errorCallBack) => _fetchService(`MachineAllocation/${data.id}`, 'DELETE', data, successCallback, errorCallBack);
export const Machinenameview = (successCallback, errorCallBack) => _fetchService(`MachineAllocation/name`, 'GET', {}, successCallback, errorCallBack);
export const MachineDevicenameview = (data, successCallback, errorCallBack) => _fetchService(`MachineAllocation/name/${data.id}`, 'POST', data, successCallback, errorCallBack);
export const MachineTagnameview = (data, successCallback, errorCallBack) => _fetchService(`MachineAllocation/tagName/${data.id}`, 'POST', data, successCallback, errorCallBack);
export const MachineAddexcel = (data, successCallback, errorCallBack) => _fetchService(`MachineAllocation/excel`, 'POST', data, successCallback, errorCallBack);

// MMACHINE DOWNTIME AND OCCURRENCE DETAILS
export const MACHINEDOWNTIMEView = (data, successCallback, errorCallBack) => _fetchService('machineController/machine_metric_datewise', 'POST', data, successCallback, errorCallBack);
export const MACHINEDOWNTIMEViewBymachine = (data, successCallback, errorCallBack) => _fetchService('machineController/machine-data', 'POST', data, successCallback, errorCallBack);
export const MACHINEGraphView = (data, successCallback, errorCallBack) => _fetchService('machineController/machine-graph', 'POST', data, successCallback, errorCallBack);
export const MACHINEGraphViewbymachine = (data, successCallback, errorCallBack) => _fetchService('machineController/singlemachine-graph', 'POST', data, successCallback, errorCallBack);
export const Machinedata = (successCallback, errorCallBack) => _fetchService(`machineController/showmachinename`, 'GET', {}, successCallback, errorCallBack);
export const MACHINEGraphViewbymachineFilter = (data, successCallback, errorCallBack) => _fetchService('machineController/singlemachine-graphcalc', 'POST', data, successCallback, errorCallBack);

// UPLOAD LOGO AND COMPANY NAME
export const UploadCompanyLogo = (data, successCallback, errorCallBack) => _fetchService('companyDetails/LogoUpload', 'POST', data, successCallback, errorCallBack);

// GET COMPANY DETAILS
export const GetCompanyDetails = (successCallback, errorCallBack) => _fetchService(`companyDetails`, 'GET', {}, successCallback, errorCallBack);

// UPLOAD COMPANY VIDEO — FormData (multer), NOT JSON, same reasoning as ScadaUploadImage
export const UploadCompanyVideo = (formData, successCallback, errorCallBack) => {
    const { token } = ApplicationStore().getStorage('userDetails');
    const END_POINT = process.env.REACT_APP_EMS_API_URL;
    fetch(`${END_POINT}companyDetails/VideoUpload`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` }, // no Content-Type; browser sets multipart boundary
        body: formData,
    })
        .then(res => res.json())
        .then(data => successCallback(data))
        .catch(err => errorCallBack(err));
};

/////----Incomer  List-----////
export const IncomerAdd = (data, successCallback, errorCallBack) => _fetchService(`incomer`, 'POST', data, successCallback, errorCallBack);
export const IncomerShowdata = (successCallback, errorCallBack) => _fetchService(`incomer`, 'GET', {}, successCallback, errorCallBack);
export const IncomerPlantShowdata = (data, successCallback, errorCallBack) => _fetchService(`incomer/${data.id}`, 'GET', {}, successCallback, errorCallBack);
export const IncomerUpdate = (data, successCallback, errorCallBack) => _fetchService(`incomer/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const IncomerDelete = (data, successCallback, errorCallBack) => _fetchService(`incomer/${data.id}`, 'DELETE', data, successCallback, errorCallBack);
/////Plants////
export const PlantsAdd = (data, successCallback, errorCallBack) => _fetchService(`plants`, 'POST', data, successCallback, errorCallBack);
export const PlantsShowdata = (successCallback, errorCallBack) => _fetchService(`plants`, 'GET', {}, successCallback, errorCallBack);
export const PlantsUpdate = (data, successCallback, errorCallBack) => _fetchService(`plants/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const PlantsDelete = (data, successCallback, errorCallBack) => _fetchService(`plants/${data.id}`, 'DELETE', data, successCallback, errorCallBack);



///Distributer///
export const DistributerShowData = (successCallback, errorCallBack) => _fetchService(`distributor`, 'GET', {}, successCallback, errorCallBack);
export const DistributerShowDataFiltered = (data, successCallback, errorCallBack) => _fetchService(`distributor?plantId=${data.plantId}&incomerId=${data.incomerId}`, 'GET', {}, successCallback, errorCallBack);
export const DistributerAdd = (data, successCallback, errorCallBack) => _fetchService('distributor', 'POST', data, successCallback, errorCallBack);
export const DistributerUpdate = (data, successCallback, errorCallBack) => _fetchService(`distributor/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const DistributerDelete = (data, successCallback, errorCallBack) => _fetchService(`distributor/${data.id}`, 'DELETE', data, successCallback, errorCallBack);
export const PlantSearch = (data, successCallback, errorCallBack) => _fetchService(`plants/search`, 'POST', data, successCallback, errorCallBack);
///Feeder
export const FeederShowData = (successCallback, errorCallBack) => _fetchService(`feeder`, 'GET', {}, successCallback, errorCallBack);
export const FeederShowDataFiltered = (data, successCallback, errorCallBack) => _fetchService(`feeder/showDropdown?plantId=${data.plantId}&incomerId=${data.incomerId}&distributorId=${data.distributorId}`, 'GET', {}, successCallback, errorCallBack);
export const FeederAdd = (data, successCallback, errorCallBack) => _fetchService('feeder', 'POST', data, successCallback, errorCallBack);
export const FeederUpdate = (data, successCallback, errorCallBack) => _fetchService(`feeder/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const FeederDelete = (data, successCallback, errorCallBack) => _fetchService(`feeder/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

// Energy Report Email Configuration
export const ReportSettingsShow = (module, successCallback, errorCallBack) => _fetchService(`reportSettings?module=${module}`, 'GET', {}, successCallback, errorCallBack);
export const ReportSettingsUpdate = (data, successCallback, errorCallBack) => _fetchService(`reportSettings/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const EmailRecipientsShow = (successCallback, errorCallBack) => _fetchService('emailRecipients', 'GET', {}, successCallback, errorCallBack);
export const EmailRecipientsAdd = (data, successCallback, errorCallBack) => _fetchService('emailRecipients', 'POST', data, successCallback, errorCallBack);
export const EmailRecipientsDelete = (data, successCallback, errorCallBack) => _fetchService(`emailRecipients/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

//Add Alert Configuration
export const AlertConfigurationShowData = (successCallback, errorCallBack) => _fetchService(`alert`, 'GET', {}, successCallback, errorCallBack);
export const AddAlertConfiguration = (data, successCallback, errorCallBack) => _fetchService('alert/alertSettingAdd', 'POST', data, successCallback, errorCallBack);
export const AlertConfigurationDelete = (data, successCallback, errorCallBack) => _fetchService(`alert/${data.id}`, 'DELETE', data, successCallback, errorCallBack);
export const AlertConfigurationUpdate = (data, successCallback, errorCallBack) => _fetchService(`alert/${data.id}`, 'PUT', data, successCallback, errorCallBack);

//SMS Configuration
export const SmsConfigurationShowData = (successCallback, errorCallBack) => _fetchService(`smsSettings`, 'GET', {}, successCallback, errorCallBack);
export const AddSmsConfiguration = (data, successCallback, errorCallBack) => _fetchService('smsSettings/smsSettingAdd', 'POST', data, successCallback, errorCallBack);
export const SmsConfigurationDelete = (data, successCallback, errorCallBack) => _fetchService(`smsSettings/${data.id}`, 'DELETE', data, successCallback, errorCallBack);
export const SmsConfigurationUpdate = (data, successCallback, errorCallBack) => _fetchService(`smsSettings/${data.id}`, 'PUT', data, successCallback, errorCallBack);

//Alert Recipients
export const AlertRecipientsShow = (successCallback, errorCallBack) => _fetchService('alertRecipients', 'GET', {}, successCallback, errorCallBack);
export const AlertRecipientsAdd = (data, successCallback, errorCallBack) => _fetchService('alertRecipients', 'POST', data, successCallback, errorCallBack);
export const AlertRecipientsUpdate = (data, successCallback, errorCallBack) => _fetchService(`alertRecipients/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const AlertRecipientsDelete = (data, successCallback, errorCallBack) => _fetchService(`alertRecipients/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

//SMS Wallet
export const SmsWalletSummary = (successCallback, errorCallBack) => _fetchService('smsWallet/summary', 'GET', {}, successCallback, errorCallBack);
export const SmsWalletPurchaseHistory = (successCallback, errorCallBack) => _fetchService('smsWallet/purchaseHistory', 'GET', {}, successCallback, errorCallBack);
export const SmsWalletSendLog = (successCallback, errorCallBack) => _fetchService('smsWallet/sendLog', 'GET', {}, successCallback, errorCallBack);
export const SmsWalletAddPackage = (data, successCallback, errorCallBack) => _fetchService('smsWallet/addPackage', 'POST', data, successCallback, errorCallBack);

////Region ///////
export const RegionShow = (successCallback, errorCallBack) => _fetchService('regions', 'GET', {}, successCallback, errorCallBack);

export const RegionAddData = (data, successCallback, errorCallBack) => _fetchService('regions', 'POST', data, successCallback, errorCallBack);

export const RegionAddUpdate = (data, successCallback, errorCallBack) => _fetchService(`regions/${data.id}`, 'PUT', data, successCallback, errorCallBack);

export const RegionDelete = (data, successCallback, errorCallBack) => _fetchService(`regions/delete/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

////Loacations//
export const LoactionShow = (data, successCallback, errorCallBack) => _fetchService('locations/getAllLocations', 'Post', data, successCallback, errorCallBack);

export const LocationAdd = (data, successCallback, errorCallBack) => _fetchService('locations', 'POST', data, successCallback, errorCallBack);

export const LocationUpdate = (data, successCallback, errorCallBack) => _fetchService(`locations/${data.id}`, 'PUT', data, successCallback, errorCallBack);

export const LocationDelete = (data, successCallback, errorCallBack) => _fetchService(`locations/delete/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

export const PlantMapDataService = (successCallback, errorCallBack) => _fetchService('locations/plantMapData', 'GET', {}, successCallback, errorCallBack);

///Area///
export const AreaAddShow = (successCallback, errorCallBack) => _fetchService('locations/getAllLocations', 'GET', {}, successCallback, errorCallBack);

export const AreShowList = (data, successCallback, errorCallBack) => _fetchService('areas/getAreasWithLocation', 'POST', data, successCallback, errorCallBack);

export const AreaAdd = (data, successCallback, errorCallBack) => _fetchService('areas', 'POST', data, successCallback, errorCallBack);

export const AreaUpdate = (data, successCallback, errorCallBack) => _fetchService(`areas/update/${data.id}`, 'PUT', data, successCallback, errorCallBack);

export const AreaDelete = (data, successCallback, errorCallBack) => _fetchService(`areas/delete/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

///Building////
export const BuildingShowList = (data, successCallback, errorCallBack) => _fetchService('buildings/getAllBuildingsWithDetails', 'POST', data, successCallback, errorCallBack);

export const BuildingAdd = (data, successCallback, errorCallBack) => _fetchService('buildings/add', 'POST', data, successCallback, errorCallBack);

export const BuildingUpdate = (data, successCallback, errorCallBack) => _fetchService(`buildings/update/${data.id}`, 'PUT', data, successCallback, errorCallBack);

export const BuildingDelete = (data, successCallback, errorCallBack) => _fetchService(`buildings/delete/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

//////Floor////
export const FloorShowList = (data, successCallback, errorCallBack) => _fetchService('floors/getAllFloorsWithDetails', 'POST', data, successCallback, errorCallBack);

export const FloorAdd = (data, successCallback, errorCallBack) => _fetchService('floors/add', 'POST', data, successCallback, errorCallBack);

export const FloorUpdate = (data, successCallback, errorCallBack) => _fetchService(`floors/update/${data.id}`, 'PUT', data, successCallback, errorCallBack);

export const FloorDelete = (data, successCallback, errorCallBack) => _fetchService(`floors/delete/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

///MeterBuild/////

export const MeterBuildingShowList = (successCallback, errorCallBack) => _fetchService('buildings', 'GET', {}, successCallback, errorCallBack);

export const MetterMappingList = (data, successCallback, errorCallBack) => _fetchService(`MeterAllocation/getMeters?buildingId=${data.buildingId}&distributerId=${data.distributorId}&feederId=${data.feederId}`, 'GET', {}, successCallback, errorCallBack);

//////CategoryList//////
export const CategoryShowList = (successCallback, errorCallBack) => _fetchService('maincategory/getMainCategory', 'GET', {}, successCallback, errorCallBack);

export const CategoryAdd = (data, successCallback, errorCallBack) => _fetchService('maincategory/add', 'POST', data, successCallback, errorCallBack);

export const CategoryUpdate = (data, successCallback, errorCallBack) => _fetchService(`maincategory/update/${data.id}`, 'PUT', data, successCallback, errorCallBack);

export const CategoryDelete = (data, successCallback, errorCallBack) => _fetchService(`maincategory/delete/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

///////SubCategory//////
export const SubCategoryShowList = (data, successCallback, errorCallBack) => _fetchService(`subcategory?categoryId=${data.categoryId}`, 'GET', {}, successCallback, errorCallBack);

export const SubCategoryAdd = (data, successCallback, errorCallBack) => _fetchService('subcategory/add', 'POST', data, successCallback, errorCallBack);

export const SubCategoryUpdate = (data, successCallback, errorCallBack) => _fetchService(`subcategory/update/${data.id}`, 'PUT', data, successCallback, errorCallBack);

export const SubCategoryDelete = (data, successCallback, errorCallBack) => _fetchService(`subcategory/delete/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

export const BuildingFloorShowList = (data, successCallback, errorCallBack) => _fetchService(`floors?buildingId=${data.buildingId}`, 'GET', {}, successCallback, errorCallBack);

////Distributor/////
export const DistributorShowList = (successCallback, errorCallBack) => _fetchService('distributor/show', 'GET', {}, successCallback, errorCallBack);

export const ShowFeederList = (data, successCallback, errorCallBack) => _fetchService(`feeder/showFeeder?distributerId=${data.distributorId}`, 'GET', {}, successCallback, errorCallBack);

// UtilityMeter
export const UtilityMeterAdd = (data, successCallback, errorCallBack) => _fetchService('UtilityMeter', 'POST', data, successCallback, errorCallBack);
export const UtilityMeterView = (successCallback, errorCallBack) => _fetchService('UtilityMeter', 'GET', {}, successCallback, errorCallBack);
export const GetUtilitySensorStats = (successCallback, errorCallBack) => _fetchService('UtilityMeter/sensorStats', 'GET', {}, successCallback, errorCallBack);
// Hour-wise / day-wise consumption breakdown for one meter — range: 'today' | 'week' | 'month' | 'custom'
export const GetUtilityMeterDashboard = (meterId, range, successCallback, errorCallBack) => _fetchService(
  `UtilityMeter/dashboard?meterId=${meterId}&range=${range || 'today'}`,
  'GET', {}, successCallback, errorCallBack
);
// Custom date-range consumption report for one meter (used by Water/Gas/Fuel report tabs)
// cycleType: 'calendar' (default, midnight-to-midnight), 'shift' (8PM-to-8PM, 24h),
// 'dayShift' (8AM-to-8PM, 12h), 'nightShift' (8PM-to-8AM, 12h) or 'hour' (exact
// datetime range, no day-bucketing — fromDate/toDate must be full datetime strings)
export const GetUtilityMeterReport = (meterId, fromDate, toDate, cycleType = 'calendar', successCallback, errorCallBack) => _fetchService(
  `UtilityMeter/dashboard?meterId=${meterId}&range=custom&from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(toDate)}&cycleType=${cycleType}`,
  'GET', {}, successCallback, errorCallBack
);
export const UtilityMeterViewedit = (data, successCallback, errorCallBack) => _fetchService(`UtilityMeter/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const UtilityMeterViewdelete = (data, successCallback, errorCallBack) => _fetchService(`UtilityMeter/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

// UtilityGroupMeter
export const UtilityGroupMeterAdd = (data, successCallback, errorCallBack) => _fetchService('UtilityGroupMeter/group', 'POST', data, successCallback, errorCallBack);
export const UtilityGroupMeterView = (data, successCallback, errorCallBack) => _fetchService('UtilityGroupMeter/getGrouped', 'POST', data, successCallback, errorCallBack);
export const UtilityGroupMeterDelete = (data, successCallback, errorCallBack) => _fetchService('UtilityGroupMeter/ungroup', 'POST', data, successCallback, errorCallBack);

export const GroupMappingMeter = (data, successCallback, errorCallBack) => _fetchService('MeterAllocation/groupMeters', 'POST', data, successCallback, errorCallBack);

////  IoT Dashboard Tree  ////
// meterKind/sensorTypes are optional — only the Temperature/Humidity/CO2 sensor
// dashboards pass them (to scope the tree to Utility-Meter categories that have
// a matching meterType grouped somewhere under them); the Energy Dashboard tree
// never sends them, so its query/behavior is unchanged.
export const GetDashboardTree = (data, successCallback, errorCallBack) => _fetchService(
  `dashboard/tree?type=${data.type}${data.id !== undefined && data.id !== null ? `&id=${data.id}` : ''}${data.selectedCategory ? `&selectedCategory=${encodeURIComponent(data.selectedCategory)}` : ''}${data.plantId !== undefined && data.plantId !== null ? `&plantId=${data.plantId}` : ''}${data.meterKind ? `&meterKind=${encodeURIComponent(data.meterKind)}` : ''}${data.sensorTypes ? `&sensorTypes=${encodeURIComponent(data.sensorTypes)}` : ''}`,
  'GET', {}, successCallback, errorCallBack
);

////  Utility meters grouped at a cat_item/cat_sub tree node (Temperature/Humidity/CO2 dashboards) ////
export const GetUtilityGroupedMeters = (data, successCallback, errorCallBack) => _fetchService(
  `dashboard/utilityGroupedMeters?type=${data.type}&id=${data.id}&sensorTypes=${encodeURIComponent(data.sensorTypes)}`,
  'GET', {}, successCallback, errorCallBack
);

////  Single-tag live value from live_tag_snapshot (sensor dashboards' "current" gauge reading) ////
export const GetTagLiveValue = (data, successCallback, errorCallBack) => _fetchService(
  `dashboard/liveTagValue?deviceId=${data.deviceId}&slaveId=${data.slaveId}&tagId=${data.tagId}`,
  'GET', {}, successCallback, errorCallBack
);

////  Flat meter list for a plant (id + display name) — Plant Overview's "Pick Meter(s)" picker ////
export const GetMeterOptions = (data, successCallback, errorCallBack) => _fetchService(
  `dashboard/meterOptions?plantId=${data.plantId}`,
  'GET', {}, successCallback, errorCallBack
);

////  Current-hour kWh, summed across one or more meterIds (energy_data_view) — Plant Overview's meter-group override ////
export const GetMeterCurrentHourValue = (data, successCallback, errorCallBack) => _fetchService(
  `dashboard/meterCurrentHourValue?meterIds=${(data.meterIds || []).join(',')}`,
  'GET', {}, successCallback, errorCallBack
);

////  Plant Overview consumption panel — manual meter-picker config (shared, one row) ////
export const ShowPlantConsumptionConfig = (successCallback, errorCallBack) => _fetchService('plantConsumptionConfig/showData', 'POST', {}, successCallback, errorCallBack);
export const SavePlantConsumptionConfig = (data, successCallback, errorCallBack) => _fetchService('plantConsumptionConfig/save', 'POST', data, successCallback, errorCallBack);

////  IoT Dashboard Live KPI Data  ////
export const GetIoTLiveData = (data, successCallback, errorCallBack) => _fetchService(
  `dashboard/liveData?type=${data.type}&id=${data.id}${data.selectedCategory ? `&selectedCategory=${encodeURIComponent(data.selectedCategory)}` : ''}${data.plantId !== undefined && data.plantId !== null ? `&plantId=${data.plantId}` : ''}`,
  'GET', {}, successCallback, errorCallBack
);

////  IoT Dashboard Meter Detail Popup  ////
export const GetMeterDetail = (data, successCallback, errorCallBack) => _fetchService(`dashboard/meterDetail?meterId=${data.meterId}`, 'GET', {}, successCallback, errorCallBack);

////  IoT Dashboard Sensor Parameters (available tags for a node) ////
export const GetIoTSensorParams = (data, successCallback, errorCallBack) => _fetchService(
  `dashboard/sensorParams?nodeType=${data.nodeType}&nodeId=${data.nodeId}`,
  'GET', {}, successCallback, errorCallBack
);

////  IoT Meter Dashboard — single call returns defaultGraphs + allocatedParameters + alerts ////
export const GetMeterDashboard = (meterId, successCallback, errorCallBack) => _fetchService(
  `dashboard/meterDashboard/${meterId}`,
  'GET', {}, successCallback, errorCallBack
);

////  Update saved default graph settings for one meter card position ////
export const UpdateMeterDefaultSettings = (meterId, data, successCallback, errorCallBack) => _fetchService(
  `dashboard/meterDashboard/${meterId}/settings`,
  'PUT', data, successCallback, errorCallBack
);

////  Get sensor parameters for a specific deviceId + slaveId (used in settings dropdown) ////
export const GetDeviceParams = (data, successCallback, errorCallBack) => _fetchService(
  `dashboard/deviceParams?deviceId=${data.deviceId}&slaveId=${data.slaveId}`,
  'GET', {}, successCallback, errorCallBack
);

////  IoT Dashboard Sensor Graph Data ////
export const GetIoTSensorGraph = (data, successCallback, errorCallBack) => _fetchService(
  `dashboard/sensorGraph?deviceId=${data.deviceId}&tagId=${data.tagId}${data.slaveId ? `&slaveId=${data.slaveId}` : ''}&last=${data.last || '15days'}&aggregation=${data.aggregation || 'min'}&interval=${data.interval || '1hr'}`,
  'GET', {}, successCallback, errorCallBack
);

// Ungroup meters
export const UnGroupMappingMeter = (data, successCallback, errorCallBack) => _fetchService('MeterAllocation/ungroupMeters', 'POST', data, successCallback, errorCallBack);

// Show currently grouped meters by scope
export const GroupedMetersShow = (data, successCallback, errorCallBack) => _fetchService('MeterAllocation/getMetersByCategory', 'POST', data, successCallback, errorCallBack);

// Catergory Wise Consumption
export const CategoryWiseConsumtion = (data, successCallback, errorCallBack) => _fetchService('mainApi/showdata', 'POST', data, successCallback, errorCallBack);

export const CategoryDayWiseData = (data, successCallback, errorCallBack) => _fetchService('mainApi/showdaywise', 'POST', data, successCallback, errorCallBack);

export const CategoryHoursWiseData = (data, successCallback, errorCallBack) => _fetchService('mainApi/showhourwise', 'POST', data, successCallback, errorCallBack);

export const CategoryMonthWiseSelectData = (data, successCallback, errorCallBack) => _fetchService('mainApi/categoryEnergyByMonth', 'POST', data, successCallback, errorCallBack);

export const FloorCategoryShowList = (successCallback, errorCallBack) => _fetchService('MeterAllocation/getSubCategoryEnergy', 'GET', {}, successCallback, errorCallBack);

// Meter Category Master
export const MeterCategoryAdd = (data, successCallback, errorCallBack) => _fetchService('MeterCategory', 'POST', data, successCallback, errorCallBack);
export const MeterCategoryShowList = (successCallback, errorCallBack) => _fetchService('MeterCategory', 'GET', {}, successCallback, errorCallBack);
export const MeterCategoryByKind = (meterKind, successCallback, errorCallBack) => _fetchService(`MeterCategory?meterKind=${encodeURIComponent(meterKind)}`, 'GET', {}, successCallback, errorCallBack);
export const MeterCategoryUpdate = (data, successCallback, errorCallBack) => _fetchService(`MeterCategory/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const MeterCategoryDelete = (data, successCallback, errorCallBack) => _fetchService(`MeterCategory/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

// Meter Type Master
export const MeterTypeAdd = (data, successCallback, errorCallBack) => _fetchService('MeterTypeMaster', 'POST', data, successCallback, errorCallBack);
export const MeterTypeShowList = (successCallback, errorCallBack) => _fetchService('MeterTypeMaster', 'GET', {}, successCallback, errorCallBack);
export const MeterTypeByCategory = (categoryId, successCallback, errorCallBack) => _fetchService(`MeterTypeMaster?categoryId=${categoryId}`, 'GET', {}, successCallback, errorCallBack);
export const MeterTypeUpdate = (data, successCallback, errorCallBack) => _fetchService(`MeterTypeMaster/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const MeterTypeDelete = (data, successCallback, errorCallBack) => _fetchService(`MeterTypeMaster/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

export const SubCategoryMonthWiseData = (data, successCallback, errorCallBack) => _fetchService('MeterAllocation/subCategoryEnergyByMonth', 'POST', data, successCallback, errorCallBack);

export const SubCategoryHoursWiseData = (data, successCallback, errorCallBack) => _fetchService('MeterAllocation/subcategoryHourlyEnergy ', 'POST', data, successCallback, errorCallBack);

export const MainSubCategoryShowList = (data, successCallback, errorCallBack) => _fetchService('mainApi/getCategoryData', 'POST', data, successCallback, errorCallBack);

export const SaveChartSettingsList = (data, successCallback, errorCallBack) => _fetchService(`mainApi/saveChartSettings`, 'POST', data, successCallback, errorCallBack);

export const CategoryLiveShowList = (successCallback, errorCallBack) => _fetchService('MeterAllocation/livedata', 'GET', {}, successCallback, errorCallBack);

export const GaugeSettingsList = (data, successCallback, errorCallBack) => _fetchService(`MeterAllocation/addGaugeChart`, 'POST', data, successCallback, errorCallBack);

export const GetEBMonthlyEnergy = (successCallback, errorCallBack) => _fetchService('MeterAllocation/getEBMonthlyEnergy', 'GET', {}, successCallback, errorCallBack);

export const GetEBDailyEnergy = (data, successCallback, errorCallBack) => _fetchService('MeterAllocation/getEBDailyEnergy', 'POST', data, successCallback, errorCallBack);

export const GetEBHourlyEnergy = (data, successCallback, errorCallBack) => _fetchService('MeterAllocation/getEBHourlyEnergy', 'POST', data, successCallback, errorCallBack);

export const GetSolarMonthlyEnergy = (successCallback, errorCallBack) => _fetchService('MeterAllocation/getSolarMonthlyEnergy', 'GET', {}, successCallback, errorCallBack);
export const GetDashboardSummary   = (params, successCallback, errorCallBack) => _fetchService('MeterAllocation/dashboardSummary', 'GET', params, successCallback, errorCallBack);

export const GetSolarDailyEnergy = (data, successCallback, errorCallBack) => _fetchService('MeterAllocation/getSolarDailyEnergy', 'POST', data, successCallback, errorCallBack);

export const GetSolarHourlyEnergy = (data, successCallback, errorCallBack) => _fetchService('MeterAllocation/getSolarHourlyEnergy', 'POST', data, successCallback, errorCallBack);
export const GetBuildingOtherEnergy = (data, successCallback, errorCallBack) => _fetchService('MeterAllocation/getBuildingOtherEnergy', 'POST', data, successCallback, errorCallBack);
export const GetBuildingHourlyEnergy = (data, successCallback, errorCallBack) => _fetchService('MeterAllocation/getBuildingHourlyEnergy', 'POST', data, successCallback, errorCallBack);
