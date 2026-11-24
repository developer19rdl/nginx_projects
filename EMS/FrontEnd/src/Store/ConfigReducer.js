// "use strict";

import {
    INFO_FETCH,
    SHOW_CAPACITY_MEASURE_TYPE,
    SHOW_CAPACITY_MEASURE_TYPE_SUCCESS,
    SHOW_CAPACITY_MEASURE_TYPE_FAILED,
    SHOW_DEPARTMENT,
    SHOW_DEPARTMENT_SUCCESS,
    SHOW_DEPARTMENT_FAILED,
    SHOW_MACHINE,
    SHOW_MACHINE_SUCCESS,
    SHOW_MACHINE_FAILED,
    SHOW_CREATED_EVENT,
    SHOW_CREATED_EVENT_SUCCESS,
    SHOW_CREATED_EVENT_FAILED,
    SHOW_OEE_PARAMETER,
    SHOW_OEE_PARAMETER_SUCCESS,
    SHOW_OEE_PARAMETER_FAILED,
    SHOW_COMPANY_DETAILS,
    SHOW_COMPANY_DETAILS_SUCCESS,
    SHOW_COMPANY_DETAILS_FAILED
} from '../Actions/Type';

const INITIAL_STATE = {
    name: "keerthi",
    capacityMeasureLoader: false,
    capacityMeasureList: [],
    departmentLoader: false,
    departmentList: [],
    machineLoader: false,
    machineList: [],
    createdEventLoader: false,
    createdEventList: [],
    oeeParameterLoader: false,
    oeeParameterList: [],
    companyDetailsLoader: false,
    companyDetails: ''
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case INFO_FETCH:
            return { ...state, name: action.payload };
        case SHOW_CAPACITY_MEASURE_TYPE:
            return { ...state, capacityMeasureLoader: true };
        case SHOW_CAPACITY_MEASURE_TYPE_SUCCESS:
            return { ...state, capacityMeasureList: action.payload, capacityMeasureLoader: true };
        case SHOW_CAPACITY_MEASURE_TYPE_FAILED:
            return { ...state, capacityMeasureLoader: false };
        case SHOW_DEPARTMENT:
            return { ...state, departmentLoader: true };
        case SHOW_DEPARTMENT_SUCCESS:
            return { ...state, departmentList: action.payload, departmentLoader: false };
        case SHOW_DEPARTMENT_FAILED:
            return { ...state, departmentLoader: false };
        case SHOW_MACHINE:
            return { ...state, machineLoader: true };
        case SHOW_MACHINE_SUCCESS:
            return { ...state, machineList: action.payload, machineLoader: false };
        case SHOW_MACHINE_FAILED:
            return { ...state, machineLoader: false };
        case SHOW_CREATED_EVENT:
            return { ...state, createdEventLoader: true };
        case SHOW_CREATED_EVENT_SUCCESS:
            return { ...state, createdEventList: action.payload, createdEventLoader: false };
        case SHOW_CREATED_EVENT_FAILED:
            return { ...state, createdEventLoader: false };
        case SHOW_OEE_PARAMETER:
            return { ...state, oeeParameterLoader: true };
        case SHOW_OEE_PARAMETER_SUCCESS:
            return { ...state, oeeParameterList: action.payload, oeeParameterLoader: false };
        case SHOW_OEE_PARAMETER_FAILED:
            return { ...state, oeeParameterLoader: false };
        case SHOW_COMPANY_DETAILS:
            return { ...state, companyDetailsLoader: true };
        case SHOW_COMPANY_DETAILS_SUCCESS:
            return { ...state, companyDetails: action.payload, companyDetailsLoader: false };
        case SHOW_COMPANY_DETAILS_FAILED:
            return { ...state, companyDetailsLoader: false };
        default:
            return state;
    }
};