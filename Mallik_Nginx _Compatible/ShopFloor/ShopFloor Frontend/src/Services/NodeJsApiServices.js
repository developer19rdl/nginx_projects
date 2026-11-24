import { data } from 'autoprefixer';
import ApplicationStore from '../utils/localStorageUtil';

const successCaseCode = [200, 201];

const _fetchService = (PATH, serviceMethod, data, successCallback, errorCallBack) => {
    const { accessToken, userDetails, date } = ApplicationStore().getStorage('userDetails');

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
                        // location.reload();
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

// FOR MALLIK CHECKLIST 
const _fetchMallikErpService = (PATH, serviceMethod, data, successCallback, errorCallBack) => {
    const { token, userDetails } = ApplicationStore().getStorage('userDetails');

    const END_POINT = process.env.REACT_APP_MALLIK_API_URL;

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
            if (error && typeof error.errorObject?.then === 'function') {
                error.errorObject.then((errorResponse) => {
                    if (error.errorStatus === 401 && errorResponse.message === 'Unable to access the page, Token Expired') {
                        ApplicationStore().clearStorage();
                        // location.reload();
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



export const FetchErpToolsService = (successCallback, errorCallBack) => _fetchMallikErpService('addtool/getTool', 'GET', {}, successCallback, errorCallBack);


export const FetchMachinesStatusService = (successCallback, errorCallBack) => _fetchService('MachineStatus', 'GET', {}, successCallback, errorCallBack);
export const ShowServiceAlert = (successCallback, errorCallBack) => _fetchService('MainteAppro/showservicealert', 'GET', {}, successCallback, errorCallBack);
export const ShowSensorAlert = (successCallback, errorCallBack) => _fetchService('MainteAppro/showsensoralert', 'GET', {}, successCallback, errorCallBack);
export const EnergyconsumptionService = (successCallback, errorCallBack) => _fetchService('energy', 'GET', {}, successCallback, errorCallBack);
export const KwhEnergyService = (successCallback, errorCallBack) => _fetchService('energy/24HourEnergyTrend', 'GET', {}, successCallback, errorCallBack);
export const GetEnergyDataListService = (successCallback, errorCallBack) => _fetchService('energy/kebData', 'GET', {}, successCallback, errorCallBack);
export const GeneratorListService = (successCallback, errorCallBack) => _fetchService('energy/genratorData', 'GET', {}, successCallback, errorCallBack);
export const EnergyReportService = (data, successCallback, errorCallBack) => _fetchService('report/energyConsum', 'POST', data, successCallback, errorCallBack);
export const MachineListService = (successCallback, errorCallBack) => _fetchService('energy/meterDropDownList', 'GET', {}, successCallback, errorCallBack);
export const OeeDetails = (data, successCallback, errorCallBack) => _fetchService('oee/FetchActual', 'POST', data, successCallback, errorCallBack);
export const OeePlanedProduced = (data, successCallback, errorCallBack) => _fetchService('oee', 'POST', data, successCallback, errorCallBack);

export const MeterDataOnOffStatus = (successCallback, errorCallBack) => _fetchService('energy/meterDataOnOffStatus', 'GET', {}, successCallback, errorCallBack);

// ENERGY PIE CHART
export const getTopFiveEnergyReport = (data, successCallback, errorCallBack) => _fetchService('report/top5energyData', 'POST', data, successCallback, errorCallBack);
export const getEnergyGraphReport = (data, successCallback, errorCallBack) => _fetchService('report/energydatagraph', 'POST', data, successCallback, errorCallBack);

// KEB INSIDE CARD
export const GetKEBCurrentData = (successCallback, errorCallBack) => _fetchService('KEBcalculation', 'GET', {}, successCallback, errorCallBack);
export const GetHourlyPowerByDevice = (successCallback, errorCallBack) => _fetchService('KEBcalculation/HrPowerDeviceData', 'GET', {}, successCallback, errorCallBack);
export const GetTopFiveDevices = (successCallback, errorCallBack) => _fetchService('KEBcalculation/TopDeviceConsumption', 'GET', {}, successCallback, errorCallBack);
export const GetEnergyConsumption = (successCallback, errorCallBack) => _fetchService('KEBcalculation/energyconsumptionday', 'GET', {}, successCallback, errorCallBack);

export const GetEnergyConsumptionMonth = (successCallback, errorCallBack) => _fetchService('KEBcalculation/getEnergyConsumptionMonthWise', 'GET', {}, successCallback, errorCallBack);

// GENERATOR INSIDE CARD
export const GetGeneratorRunHours = (successCallback, errorCallBack) => _fetchService('Generatorfuel/generatorrunninghours', 'GET', {}, successCallback, errorCallBack);
export const GetGeneratorCurrentData = (successCallback, errorCallBack) => _fetchService('Generatorfuel', 'GET', {}, successCallback, errorCallBack);
export const GetGeneratorTopUp = (successCallback, errorCallBack) => _fetchService('Generatorfuel/TopDeviceConsumption', 'GET', {}, successCallback, errorCallBack);
export const GetEnergyGeneration = (successCallback, errorCallBack) => _fetchService('Generatorfuel/energyconsumptionday', 'GET', {}, successCallback, errorCallBack);

///Energy Hour///
export const EnergyHourReportService = (data, successCallback, errorCallBack) => _fetchService('report/EnergyHourReport', 'POST', data, successCallback, errorCallBack);

//REPORT/OEE
export const GetOeeMachineList = (successCallback, errorCallBack) => _fetchService('report/machineList', 'GET', {}, successCallback, errorCallBack);
export const GetProdTypeBasedMachineList = (data, successCallback, errorCallBack) => _fetchService('report/prodTypeMachineList', 'POST', data, successCallback, errorCallBack);
export const GetOeeTableReport = (data, successCallback, errorCallBack) => _fetchService('oee/OeeReport', 'POST', data, successCallback, errorCallBack);
export const GetOeeFactorPieReport = (data, successCallback, errorCallBack) => _fetchService('oeegraphreport/graph', 'POST', data, successCallback, errorCallBack);
export const GetOeeDowntimePieReport = (data, successCallback, errorCallBack) => _fetchService('oeegraphreport/downtimegraph', 'POST', data, successCallback, errorCallBack);

///Report Production
export const GetProductionTableReport = (data, successCallback, errorCallBack) => _fetchService('report/productionReport', 'POST', data, successCallback, errorCallBack);
export const GetOperatorList = (data, successCallback, errorCallBack) => _fetchService('operatorlog/showdropdown', 'POST', data, successCallback, errorCallBack);
export const GetProductionOperatorTableData = (data, successCallback, errorCallBack) => _fetchService('operatorlog/showproductionvalues', 'POST', data, successCallback, errorCallBack);

//OVER TIME COST IMPACT ANALYSIS
export const GetOverTimeCostImpact = (data, successCallback, errorCallBack) => _fetchService('report/OverTimeCostImpact', 'POST', data, successCallback, errorCallBack);


//IdleTime cost Impact Analysis
export const GetIdleTimeAnalysisReport = (data, successCallback, errorCallBack) => _fetchService('report/idleTimeReport', 'POST', data, successCallback, errorCallBack);

// total idle time
export const GetConsolidateIdleTimeReport = (data, successCallback, errorCallBack) => _fetchService('report/consolidateIdleTimeReport', 'POST', data, successCallback, errorCallBack);


// OverTimeCostImpact


////Machine List///
export const FetchMachineListService = (successCallback, errorCallBack) => _fetchService('machineList', 'GET', {}, successCallback, errorCallBack);

///User List////
export const UserListService = (successCallback, errorCallBack) => _fetchService('user', 'GET', {}, successCallback, errorCallBack);
export const UserAddService = (data, successCallback, errorCallBack) => _fetchService('user', 'POST', data, successCallback, errorCallBack);
export const UserEditType = (data, successCallback, errorCallBack) => _fetchService(`user/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const UserDeleteService = (data, successCallback, errorCallBack) => _fetchService(`user/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

//DEPARTMENT///
export const DepartmentList = (successCallback, errorCallBack) => _fetchService('Department', 'GET', {}, successCallback, errorCallBack);

/////OPERATOR/////////
export const OperatortList = (successCallback, errorCallBack) => _fetchService('Operator/showOperator', 'GET', {}, successCallback, errorCallBack);
export const OperatortAddService = (data, successCallback, errorCallBack) => _fetchService('Operator', 'POST', data, successCallback, errorCallBack);
export const OperatortEditType = (data, successCallback, errorCallBack) => _fetchService(`Operator/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const OperatortDeleteType = (data, successCallback, errorCallBack) => _fetchService(`Operator/${data.id}`, 'DELETE', data, successCallback, errorCallBack);
export const updateOperatorPassword = (data, successCallback, errorCallBack) => _fetchService(`Operator/update/${data.id}`, 'PUT', data, successCallback, errorCallBack);

/////Role/////////
export const RoleList = (successCallback, errorCallBack) => _fetchService('roles', 'GET', {}, successCallback, errorCallBack);
export const RoleAddService = (data, successCallback, errorCallBack) => _fetchService('roles', 'POST', data, successCallback, errorCallBack);
export const RoleEditType = (data, successCallback, errorCallBack) => _fetchService(`roles/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const RoletDeleteType = (data, successCallback, errorCallBack) => _fetchService(`roles/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

/////Assign Role///
/////Role/////////
export const AssignRoleList = (successCallback, errorCallBack) => _fetchService('role-permissions/showPermissions', 'GET', {}, successCallback, errorCallBack);
export const AssignModuleListService = (successCallback, errorCallBack) => _fetchService('role-permissions/getModules', 'GET', {}, successCallback, errorCallBack);
export const AssignRoleAddService = (data, successCallback, errorCallBack) => _fetchService('role-permissions/assign', 'POST', data, successCallback, errorCallBack);
export const AssignRoleEditType = (data, successCallback, errorCallBack) => _fetchService(`role-permissions/assign`, 'POST', data, successCallback, errorCallBack);
export const AssignRoletDeleteType = (data, successCallback, errorCallBack) => _fetchService(`role-permissions/assign/${data.id}`, 'DELETE', data, successCallback, errorCallBack);



//ENERGY MONITORING SERVICES
export const GetMeterDataListService = (successCallback, errorCallBack) => _fetchService('energy/energyMeterDataList', 'GET', {}, successCallback, errorCallBack);

/////Load Shedule////
export const AddLaodSheduling = (data, successCallback, errorCallBack) => _fetchService('AssignShift/importAssignShift', 'POST', data, successCallback, errorCallBack);
export const UpdateLoadSchedule = (data, successCallback, errorCallBack) => _fetchService(`shifts/rescheduleedit/${data.id}`, 'PUT', data, successCallback, errorCallBack);

//////Repryt MAchine List///
export const allocMachinesList = (successCallback, errorCallBack) => _fetchService('report/allocMachineList', 'GET', {}, successCallback, errorCallBack);

///////OPERATOR LOG////
export const OperatorLogDropDown = (data, successCallback, errorCallBack) => _fetchService('operatorlog/showdropdown', 'POST', data, successCallback, errorCallBack);
export const AddOpearatorLog = (data, successCallback, errorCallBack) => _fetchService('operatorlog/show', 'POST', data, successCallback, errorCallBack);
// export const AddOpearatorLog = (data, successCallback, errorCallBack) => _fetchService('operatorlog/showproductionvalues', 'POST', data, successCallback, errorCallBack);


// MACHINE HEALTH DASHBOARD CARD
export const HealthDashboardMachineList = (successCallback, errorCallBack) => _fetchService('machineList/healthDashboard', 'GET', {}, successCallback, errorCallBack);

// MACHINE HEALTH INNER CARD SENSOR DROPDOWN
export const GetMachineHeaderData = (data, successCallback, errorCallBack) => _fetchService('Sensors_settongs/show', 'POST', data, successCallback, errorCallBack);
export const GetHeaderDropdown = (data, successCallback, errorCallBack) => _fetchService('sensors/showSelectAllDropdownValues', 'POST', data, successCallback, errorCallBack);
export const UpdateMachineHeaderData = (data, successCallback, errorCallBack) => _fetchService(`Sensors_settongs/${data.machineId}`, 'PUT', data, successCallback, errorCallBack);
export const GetSelectDropdown = (data, successCallback, errorCallBack) => _fetchService('sensors/showSelectAllDropdownValues', 'POST', data, successCallback, errorCallBack);
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
export const GetChartDataMachine = (data, successCallback, errorCallBack) => _fetchService('machineList/ChartDataMachine', 'POST', data, successCallback, errorCallBack);

//SCHEDULE MODULE
export const GetScheduledList = (successCallback, errorCallBack) => _fetchService('shifts/show', 'GET', {}, successCallback, errorCallBack);
export const ImportUpdatedScheduleList = (data, successCallback, errorCallBack) => _fetchService('shifts/importAssignShift', 'POST', data, successCallback, errorCallBack);
export const ImportReScheduleList = (data, successCallback, errorCallBack) => _fetchService('shifts/rescheduleupdate', 'POST', data, successCallback, errorCallBack);
export const GetAssignShiftTableData = (data, successCallback, errorCallBack) => _fetchService('shifts/ShiftAssignFormattedView', 'POST', data, successCallback, errorCallBack);

//////SHIFT OT??////
export const ImportUpdatedOTList = (data, successCallback, errorCallBack) => _fetchService('shifts/importOperatorShift', 'POST', data, successCallback, errorCallBack);
export const AssignShiftOTData = (data, successCallback, errorCallBack) => _fetchService('shifts/operatorShiftAssignFormattedView', 'POST', data, successCallback, errorCallBack);
export const ImportReScheduleOT = (data, successCallback, errorCallBack) => _fetchService('shifts/rescheduleupdateoperator', 'POST', data, successCallback, errorCallBack);


export const ShiftOtAdd = (data, successCallback, errorCallBack) => _fetchService('shifts/update-operator-ot', 'POST', data, successCallback, errorCallBack);

export const GetShowOtVerification = (successCallback, errorCallBack) => _fetchService('shifts/Show_Ot_Verification', 'GET', {}, successCallback, errorCallBack);

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
export const CertificateDueView = (data, successCallback, errorCallBack) => _fetchService('Certificate/showDatabydate', 'POST', data, successCallback, errorCallBack);
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
export const AddEnergyData = (data, successCallback, errorCallBack) => _fetchService(`AddMaxEnergy/1`, 'PUT', data, successCallback, errorCallBack);

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
export const MaintenanceShudeleName = (data, successCallback, errorCallBack) => _fetchService('MainteSchd/showAssetName', 'POST', data, successCallback, errorCallBack);
export const GetAffectedMachine = (successCallback, errorCallBack) => _fetchService('MainteSchd/showallmachines', 'GET', {}, successCallback, errorCallBack);
export const viewwarrentyStatus = (data, successCallback, errorCallBack) => _fetchService(`MainteSchd/showWarrenty/${data.id}`, 'POST', data, successCallback, errorCallBack);
export const MaintenanceshowUser = (successCallback, errorCallBack) => _fetchService('MainteSchd/showUser', 'GET', {}, successCallback, errorCallBack);
export const showOperators = (successCallback, errorCallBack) => _fetchService('Operator/', 'GET', {}, successCallback, errorCallBack);
export const showSupervisor = (successCallback, errorCallBack) => _fetchService('MainteSchd/showSupervisor', 'GET', {}, successCallback, errorCallBack);

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
export const MaintenanceshowChecklistCompleted = (successCallback, errorCallBack) => _fetchService('MainteAppro/showCheckListComp', 'GET', {}, successCallback, errorCallBack);



export const MaintenanceUpdate = (data, successCallback, errorCallBack) => _fetchService('MainteAppro/storeandupdate', 'POST', data, successCallback, errorCallBack);

export const MaintenanceUpdateCheckList = (data, successCallback, errorCallBack) => _fetchService('MainteAppro/storeAndUpdateCheckListMaient', 'POST', data, successCallback, errorCallBack);


export const MaintenanceDamagedPart = (data, successCallback, errorCallBack) => _fetchService('MainteAppro/storeDamagedParts', 'POST', data, successCallback, errorCallBack);
export const MaintenanceEditDamagedPart = (data, successCallback, errorCallBack) => _fetchService(`MainteAppro/update/${data.id}/updateDamagedParts`, 'POST', data, successCallback, errorCallBack);
export const MaintenenceDamagedList = (data, successCallback, errorCallBack) => _fetchService(`MainteAppro/showDamagedParts/${data.id}`, 'POST', data, successCallback, errorCallBack);
export const MaintenenceReplacementList = (data, successCallback, errorCallBack) => _fetchService(`MainteAppro/showReplacementParts/${data.id}`, 'POST', data, successCallback, errorCallBack);
export const MaintenanceReplacedPart = (data, successCallback, errorCallBack) => _fetchService('MainteAppro/storeReplacementParts', 'POST', data, successCallback, errorCallBack);
export const MaintenanceEditReplacedPart = (data, successCallback, errorCallBack) => _fetchService(`MainteAppro/update/${data.id}/updateReplacementParts`, 'POST', data, successCallback, errorCallBack);
export const DamageDeleteType = (data, successCallback, errorCallBack) => _fetchService(`MainteAppro/deleteDamagedParts/${data.id}/delete`, 'POST', data, successCallback, errorCallBack);
export const ReplaceDeleteType = (data, successCallback, errorCallBack) => _fetchService(`MainteAppro/deleteReplacementParts/${data.id}/delete`, 'POST', data, successCallback, errorCallBack);

// ///////////////////////////////////////   Maintenance Status    ///////////////////////////////////////////
export const showMaintanceDatabyiD = (data, successCallback, errorCallBack) => _fetchService(`MainteSchd/showDataType/${data.id}`, 'GET', {}, successCallback, errorCallBack);

export const PartsDelete = (data, successCallback, errorCallBack) => _fetchService(`MainteSchd/showDataType/${data.id}/delete`, 'POST', data, successCallback, errorCallBack);

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

export const showAlertMachineDropDown = (successCallback, errorCallBack) => _fetchService('machineList/machineAlertFilterList', 'GET', {}, successCallback, errorCallBack);

export const GetAlertReport = (data, successCallback, errorCallBack) => _fetchService('alert/alertReport', 'POST', data, successCallback, errorCallBack);

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
export const TagName = (data, successCallback, errorCallBack) => _fetchService(`TagAdd/Tagname/${data.id}`, 'POST', data, successCallback, errorCallBack);

// MeterAllocation
export const MeterAllocationAdd = (data, successCallback, errorCallBack) => _fetchService(`MeterAllocation`, 'POST', data, successCallback, errorCallBack);
export const MeterAllocationView = (successCallback, errorCallBack) => _fetchService(`MeterAllocation`, 'GET', {}, successCallback, errorCallBack);
export const MeterAllocationViewedit = (data, successCallback, errorCallBack) => _fetchService(`MeterAllocation/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const MeterAllocationViewdelete = (data, successCallback, errorCallBack) => _fetchService(`MeterAllocation/${data.id}`, 'DELETE', data, successCallback, errorCallBack);
export const MeterAllocationdeviceName = (successCallback, errorCallBack) => _fetchService(`MeterAllocation/devicename`, 'GET', {}, successCallback, errorCallBack);
export const MeterSlaveID = (data, successCallback, errorCallBack) => _fetchService(`MeterAllocation/slavename/${data.id}`, 'POST', data, successCallback, errorCallBack);
export const MeterAddexcel = (data, successCallback, errorCallBack) => _fetchService(`MeterAllocation/excel`, 'POST', data, successCallback, errorCallBack);
export const getDeviceSlaveId = (data, successCallback, errorCallBack) => _fetchService('MeterAllocation/slaveIdList', 'POST', data, successCallback, errorCallBack);

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
// export const MACHINEGraphViewbymachineFilter = (data, successCallback, errorCallBack) => _fetchService('machineController/singlemachine-graphcalc', 'POST', data, successCallback, errorCallBack);
export const MACHINEGraphViewbymachineFilter = (data, successCallback, errorCallBack) => _fetchService('machineController/singlemachine-graph', 'POST', data, successCallback, errorCallBack);



export const MtttrAllMachineMonitoring = (data, successCallback, errorCallBack) => _fetchService('machineController/faultmetric-report', 'POST', data, successCallback, errorCallBack);

// UPLOAD LOGO AND COMPANY NAME
export const UploadCompanyLogo = (data, successCallback, errorCallBack) => _fetchService('companyDetails/LogoUpload', 'POST', data, successCallback, errorCallBack);

// GET COMPANY DETAILS
export const GetCompanyDetails = (successCallback, errorCallBack) => _fetchService(`companyDetails`, 'GET', {}, successCallback, errorCallBack);

//GET GENERATOR USAGE REPORT
export const GetGeneratorUsageReport = (data, successCallback, errorCallBack) => _fetchService('report/generatorUsageReport', 'POST', data, successCallback, errorCallBack);
export const FetchGeneratorOnLogs = (data, successCallback, errorCallBack) => _fetchService('report/GeneratorOnMinutes', 'POST', data, successCallback, errorCallBack);
// export const FetchGeneratorOnLogs  = (data, successCallback, errorCallBack) => _fetchService('report/GeneratorOnMinutes', 'POST', data, successCallback, errorCallBack);

export const LoadDataGenerator = (data, successCallback, errorCallBack) => _fetchService('report/generator/report', 'POST', data, successCallback, errorCallBack);

export const LoadDataEnergyMeter  = (data, successCallback, errorCallBack) => _fetchService('report/meter/MeterSettingsReport', 'POST', data, successCallback, errorCallBack);


export const UpdateDataGenerator  = (data, successCallback, errorCallBack) => _fetchService('report/generator/update', 'POST', data, successCallback, errorCallBack);

export const UpdateDataEnergyMeter  = (data, successCallback, errorCallBack) => _fetchService('report/energyMeter/update', 'POST', data, successCallback, errorCallBack);


export const NeterDropDown = (successCallback, errorCallBack) => _fetchService(`report/meter/MeterDropDown`, 'GET', {}, successCallback, errorCallBack);




//prajwal server usage
export const FetcserverInformationService = (successCallback, errorCallBack) => _fetchService('serverStatistics/serverInformation', 'GET', {}, successCallback, errorCallBack);
export const WeldingWireConsumption = (data, successCallback, errorCallBack) => _fetchService('report/weldingWireConsumption', 'POST', data, successCallback, errorCallBack);


// welding data
export const WeldCalcAdd = (data, successCallback, errorCallBack) => _fetchService(`WeldCalc`, 'POST', data, successCallback, errorCallBack);
export const WeldCalcShowData = (successCallback, errorCallBack) => _fetchService(`WeldCalc`, 'GET', {}, successCallback, errorCallBack);
export const WeldCalcUpdate = (data, successCallback, errorCallBack) => _fetchService(`WeldCalc/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const WeldCalcDelete = (data, successCallback, errorCallBack) => _fetchService(`WeldCalc/${data.id}`, 'DELETE', data, successCallback, errorCallBack);

// MACHINE BREAKDOWN
export const MachineBreakDownTrend = (data, successCallback, errorCallBack) => _fetchService('mainReport/MachineBreakDownTrend', 'POST', data, successCallback, errorCallBack);

export const getMachines = (successCallback, errorCallBack) => _fetchService('checklist/machines', 'GET', {}, successCallback, errorCallBack);


export const getMachinesDepartmentBased = (data, successCallback, errorCallBack) => _fetchService(`checklist/machinesDepartment/${data.id}/assetTypeId/${data.typeId}`, 'GET', data, successCallback, errorCallBack);

export const getAssetDepartmentBased = (data, successCallback, errorCallBack) => _fetchService(`checklist/assetDepartment/${data.id}/assetTypeId/${data.typeId}`, 'GET', data, successCallback, errorCallBack);


export const BreakDownTrendYear = (data, successCallback, errorCallBack) => _fetchService('PrevMaint/yearlyBreakdownMaint', 'POST', data, successCallback, errorCallBack);


export const MonthlyBreakDownTrend = (data, successCallback, errorCallBack) => _fetchService('PrevMaint/monthlyBreakdownMaint', 'POST', data, successCallback, errorCallBack);



export const BreakDownMaintTrendYear = (data, successCallback, errorCallBack) => _fetchService('PrevMaint/yearlyPreventiveMaint', 'POST', data, successCallback, errorCallBack);


export const BreakDownMaintTrendMonthly = (data, successCallback, errorCallBack) => _fetchService('PrevMaint/monthlyPreventiveMaint', 'POST', data, successCallback, errorCallBack);

export const PreventiveMaintTrendYear = (data, successCallback, errorCallBack) => _fetchService('/PrevMaint/yearlyPreventiveMaint', 'POST', data, successCallback, errorCallBack);


export const PreventiveMaintTrendMonthly = (data, successCallback, errorCallBack) => _fetchService('/PrevMaint/monthlyPreventiveMaint', 'POST', data, successCallback, errorCallBack);





// -----------------------------------------------------------------------
// CHECKLIST 
/*
export const AddChecklist = (data, successCallback, errorCallBack) => _fetchMallikErpService('checklist', 'POST', data, successCallback, errorCallBack);
export const ShowCheckList = (successCallback, errorCallBack) => _fetchMallikErpService('checklist', 'GET', {}, successCallback, errorCallBack);
export const UpdateChecklist = (data, successCallback, errorCallBack) => _fetchMallikErpService(`checklist/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const ChecklistDelete = (data, successCallback, errorCallBack) => _fetchMallikErpService(`checklist/${data.id}`, 'DELETE', data, successCallback, errorCallBack);
export const ChecklistImport = (data, successCallback, errorCallBack) => _fetchMallikErpService(`checkExl/import`, 'POST', data, successCallback, errorCallBack);
// export const getMachines = (successCallback, errorCallBack) => _fetchMallikErpService('checklist/machines', 'GET', {}, successCallback, errorCallBack);
export const AssignChecklist = (data, successCallback, errorCallBack) => _fetchMallikErpService('checklist/assignchecklist', 'POST', data, successCallback, errorCallBack);
export const ViewAssignedChecklist = (data, successCallback, errorCallBack) => _fetchMallikErpService('checklist/show ', 'POST', data, successCallback, errorCallBack);

export const ViewMaintAssignedChecklist = (data, successCallback, errorCallBack) => _fetchMallikErpService('checklist/showMaintAsset', 'POST', data, successCallback, errorCallBack);

export const GetChecklistVerifyLists = (data, successCallback, errorCallBack) => _fetchMallikErpService('checklist/showverifyapi', 'POST', data, successCallback, errorCallBack);

export const ShowMaintChecklist = (data, successCallback, errorCallBack) => _fetchMallikErpService('checklist/ShowMaintChecklist', 'POST', data, successCallback, errorCallBack);


export const ShowChecklistDropDown = (data, successCallback, errorCallBack) => _fetchMallikErpService('checklist/showMachineBased', 'POST', data, successCallback, errorCallBack);



// TEMPLATE
export const AddTemplate = (data, successCallback, errorCallBack) => _fetchMallikErpService('temp', 'POST', data, successCallback, errorCallBack);
export const ShowTemplate = (successCallback, errorCallBack) => _fetchMallikErpService('temp', 'GET', {}, successCallback, errorCallBack);
export const UpdateTemplate = (data, successCallback, errorCallBack) => _fetchMallikErpService(`temp/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const TemplateDelete = (data, successCallback, errorCallBack) => _fetchMallikErpService(`temp/${data.id}`, 'DELETE', data, successCallback, errorCallBack);
export const AddTemplateLayout = (data, successCallback, errorCallBack) => _fetchMallikErpService('layout', 'POST', data, successCallback, errorCallBack);
export const GetBodyLayoutLists = (data, successCallback, errorCallBack) => _fetchMallikErpService(`layout/${data.id}/?layout=${data.selectedLayout}&frequency=${data.frequency}`, 'GET', {}, successCallback, errorCallBack);
export const DeleteBodyLayoutLists = (data, successCallback, errorCallBack) => _fetchMallikErpService(`layout/${data.id}`, 'DELETE', data, successCallback, errorCallBack);
export const UpdateBodyLayoutLists = (data, successCallback, errorCallBack) => _fetchMallikErpService(`layout/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const UpdateTableCellAnswer = (data, successCallback, errorCallBack) => _fetchMallikErpService('checklist/update', 'POST', data, successCallback, errorCallBack);
export const GetHeaderFooterData = (data, successCallback, errorCallBack) => _fetchMallikErpService(`layout/${data.id}/?layout=${data.selectedLayout}`, 'GET', {}, successCallback, errorCallBack);
export const UpdateTemplateLayout = (data, successCallback, errorCallBack) => _fetchMallikErpService(`layout/${data.id}`, 'PUT', data, successCallback, errorCallBack);

// CHECKLIST REPORT
export const GetReportSection = (data, successCallback, errorCallBack) => _fetchMallikErpService(`checklistReport/?department=${data.id}`, 'GET', {}, successCallback, errorCallBack);
export const GetReportAsset = (data, successCallback, errorCallBack) => _fetchMallikErpService(`checklistReport/asset/?section=${data.id}`, 'GET', {}, successCallback, errorCallBack);
export const GetChecklistReport = (data, successCallback, errorCallBack) => _fetchMallikErpService('checklistReport', 'POST', data, successCallback, errorCallBack);
export const AllShowMasterAdd = (data, successCallback, errorCallBack) => _fetchMallikErpService(`master/${data.masterType}`, 'GET', {}, successCallback, errorCallBack);
*/


export const AddChecklist = (data, successCallback, errorCallBack) => _fetchService('checklist', 'POST', data, successCallback, errorCallBack);
export const ShowCheckList = (successCallback, errorCallBack) => _fetchService('checklist', 'GET', {}, successCallback, errorCallBack);
export const UpdateChecklist = (data, successCallback, errorCallBack) => _fetchService(`checklist/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const ChecklistDelete = (data, successCallback, errorCallBack) => _fetchService(`checklist/${data.id}`, 'DELETE', data, successCallback, errorCallBack);
export const ChecklistImport = (data, successCallback, errorCallBack) => _fetchService(`checkExl/import`, 'POST', data, successCallback, errorCallBack);
// export const getMachines = (successCallback, errorCallBack) => _fetchMallikErpService('checklist/machines', 'GET', {}, successCallback, errorCallBack);
export const AssignChecklist = (data, successCallback, errorCallBack) => _fetchService('checklist/assignchecklist', 'POST', data, successCallback, errorCallBack);

export const ViewAssignedChecklist = (data, successCallback, errorCallBack) => _fetchService('checklist/show', 'POST', data, successCallback, errorCallBack);

export const ViewMaintAssignedChecklist = (data, successCallback, errorCallBack) => _fetchService('checklist/showMaintAsset', 'POST', data, successCallback, errorCallBack);

export const GetChecklistVerifyLists = (data, successCallback, errorCallBack) => _fetchService('checklist/showverifyapi', 'POST', data, successCallback, errorCallBack);

export const ShowMaintChecklist = (data, successCallback, errorCallBack) => _fetchService('checklist/ShowMaintChecklist', 'POST', data, successCallback, errorCallBack);


export const ShowChecklistDropDown = (data, successCallback, errorCallBack) => _fetchService('checklist/showMachineBased', 'POST', data, successCallback, errorCallBack);



// TEMPLATE
export const AddTemplate = (data, successCallback, errorCallBack) => _fetchService('temp', 'POST', data, successCallback, errorCallBack);
export const ShowTemplate = (successCallback, errorCallBack) => _fetchService('temp', 'GET', {}, successCallback, errorCallBack);
export const UpdateTemplate = (data, successCallback, errorCallBack) => _fetchService(`temp/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const TemplateDelete = (data, successCallback, errorCallBack) => _fetchService(`temp/${data.id}`, 'DELETE', data, successCallback, errorCallBack);
export const AddTemplateLayout = (data, successCallback, errorCallBack) => _fetchService('layout', 'POST', data, successCallback, errorCallBack);
export const GetBodyLayoutLists = (data, successCallback, errorCallBack) => _fetchService(`layout/${data.id}/?layout=${data.selectedLayout}&frequency=${data.frequency}`, 'GET', {}, successCallback, errorCallBack);
export const DeleteBodyLayoutLists = (data, successCallback, errorCallBack) => _fetchService(`layout/${data.id}`, 'DELETE', data, successCallback, errorCallBack);
export const UpdateBodyLayoutLists = (data, successCallback, errorCallBack) => _fetchService(`layout/${data.id}`, 'PUT', data, successCallback, errorCallBack);
export const UpdateTableCellAnswer = (data, successCallback, errorCallBack) => _fetchService('checklist/update', 'POST', data, successCallback, errorCallBack);
export const GetHeaderFooterData = (data, successCallback, errorCallBack) => _fetchService(`layout/${data.id}/?layout=${data.selectedLayout}`, 'GET', {}, successCallback, errorCallBack);
export const UpdateTemplateLayout = (data, successCallback, errorCallBack) => _fetchService(`layout/${data.id}`, 'PUT', data, successCallback, errorCallBack);

// CHECKLIST REPORT
export const GetReportSection = (data, successCallback, errorCallBack) => _fetchService(`checklistReport/?department=${data.id}`, 'GET', {}, successCallback, errorCallBack);
export const GetReportAsset = (data, successCallback, errorCallBack) => _fetchService(`checklistReport/asset/?section=${data.id}`, 'GET', {}, successCallback, errorCallBack);
export const GetChecklistReport = (data, successCallback, errorCallBack) => _fetchService('checklistReport', 'POST', data, successCallback, errorCallBack);
// export const AllShowMasterAdd = (data, successCallback, errorCallBack) => _fetchService(`master/${data.masterType}`, 'GET', {}, successCallback, errorCallBack);

export const AllShowMasterAdd = (data, successCallback, errorCallBack) => _fetchService(`master/${data.masterType}`, 'GET', {}, successCallback, errorCallBack);



export const GetMachineWiseEfficiencyGraphReport = (data, successCallback, errorCallBack) => _fetchService('report/machineWiseEfficiency', 'POST', data, successCallback, errorCallBack);
export const GetMachineWiseTargetVsProductionReport = (data, successCallback, errorCallBack) => _fetchService('report/machineWiseTargetVsProduction', 'POST', data, successCallback, errorCallBack);

export const GetPlannedShift = (data, successCallback, errorCallBack) => _fetchService('oee/machineSchedule', 'POST', data, successCallback, errorCallBack);
export const GetMtbfMonitoringReport = (data, successCallback, errorCallBack) => _fetchService('meanTime/MtbfMonitoring', 'POST', data, successCallback, errorCallBack);


export const OEEDashboardProduction = (data, successCallback, errorCallBack) => _fetchService(`oeeDashBoard/production?period=${data.period}&shift=${data.shift}`, 'GET', {}, successCallback, errorCallBack);
export const OEEDashboardAssembly = (data, successCallback, errorCallBack) => _fetchService(`oeeDashBoard/Assembly?period=${data.period}&shift=${data.shift}`, 'GET', {}, successCallback, errorCallBack);
export const OEEDashboardPlant = (data, successCallback, errorCallBack) => _fetchService(`oeeDashBoard/Plant?period=${data.period}&shift=${data.shift}`, 'GET', {}, successCallback, errorCallBack);


export const CorrectiveActionAssetService = (data, successCallback, errorCallBack) => _fetchService('AssetMeterList', 'POST', data, successCallback, errorCallBack);
export const CorrectiveActionDeleteService = (id, successCallback, errorCallBack) => _fetchService(`correctiveAction/${id}/delete`, 'POST', {}, successCallback, errorCallBack);
export const CorrectiveActionFetchService = (successCallback, errorCallBack) => _fetchService('correctiveAction/showData', 'GET', {}, successCallback, errorCallBack);
export const AssetTypeFetchService = (successCallback, errorCallBack) => _fetchService('assetType/showData', 'GET', {}, successCallback, errorCallBack);
export const AssetTabledropFetchService = (successCallback, errorCallBack) => _fetchService('correctiveAction/AssetListDropDown', 'GET', {}, successCallback, errorCallBack);

export const CorrectiveActionAddService = (data, successCallback, errorCallBack) => _fetchService('correctiveAction/add', 'POST', data, successCallback, errorCallBack);
export const CorrectiveActionEditService = (data, successCallback, errorCallBack) => _fetchService(`correctiveAction/${data.id}/update`, 'POST', data, successCallback, errorCallBack);
export const MachineEnergySavedFetchService = (successCallback, errorCallBack) => _fetchService('correctiveAction/MachineLevelEnergySavedData', 'GET', {}, successCallback, errorCallBack);
export const getMachinesAll = (successCallback, errorCallBack) => _fetchService('machineList/AllMachineListDropDown', 'GET', {}, successCallback, errorCallBack);

export const BreakdownDetailsShowData = (successCallback, errorCallBack) => _fetchService('MainteSchd/BreakdownDetailsShowData', 'GET', {}, successCallback, errorCallBack);


export const PerformanceMetricsYear = (data, successCallback, errorCallBack) => _fetchService('PerformanceMetrics/yearlyPerformanceTrend', 'POST', data,  successCallback, errorCallBack);

export const PerformanceMetricsMonth = (data, successCallback, errorCallBack) => _fetchService('PerformanceMetrics/monthlyPerformanceTrend', 'POST', data,  successCallback, errorCallBack);            
// export const BreakdownDetailsShowData = (data,successCallback, errorCallBack) =>  _fetchService(`/mainReport/BreakdownDetailsShowData`, 'POST', data, successCallback, errorCallBack);   
