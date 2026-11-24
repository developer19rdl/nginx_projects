import {
    SHOW_EDGE_DEVICE,
    SHOW_EDGE_DEVICE_SUCCESS,
    SHOW_EDGE_DEVICE_FAILED,
    SHOW_DEVICE_CATEGORY,
    SHOW_DEVICE_CATEGORY_SUCCESS,
    SHOW_DEVICE_CATEGORY_FAILED,
    SHOW_SENSOR_CATEGORY,
    SHOW_SENSOR_CATEGORY_SUCCESS,
    SHOW_SENSOR_CATEGORY_FAILED,
    GET_SENSOR_CATEGORY,
    GET_SENSOR_CATEGORY_SUCCESS,
    GET_SENSOR_CATEGORY_FAILED,
    SHOW_SENSOR,
    SHOW_SENSOR_SUCCESS,
    SHOW_SENSOR_FAILED,
    GET_SENSOR_DROPDOWN_LIST,
    GET_SENSOR_DROPDOWN_LIST_SUCCESS,
    GET_SENSOR_DROPDOWN_LIST_FAILED,
    GET_SENSOR_CATEGORY_DROPDOWN_LIST,
    GET_SENSOR_CATEGORY_DROPDOWN_LIST_SUCCESS,
    GET_SENSOR_CATEGORY_DROPDOWN_LIST_FAILED
} from '../Actions/Type';

const INITIAL_STATE = {
    edgeDeviceLoader: false,
    edgeDeviceListList: [],
    deviceCategoryLoader: false,
    deviceCategoryList: [],
    sensorCategoryLoader: false,
    sensorCategoryList: [],
    sensorCategoryDropLoader: false,
    sensorCategory: [],
    showSensorLoader: false,
    showSensorList: [],
    sensorCategoryDropdownListLoader: false,
    sensorCategoryDropdownList: [],
    sensorDropdownListLoader: false,
    sensorDropdownList: []
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case SHOW_EDGE_DEVICE:
            return { ...state, edgeDeviceLoader: true };
        case SHOW_EDGE_DEVICE_SUCCESS:
            return { ...state, edgeDeviceListList: action.payload, edgeDeviceLoader: false };
        case SHOW_EDGE_DEVICE_FAILED:
            return { ...state, edgeDeviceLoader: false };
        case SHOW_DEVICE_CATEGORY:
            return { ...state, deviceCategoryLoader: true };
        case SHOW_DEVICE_CATEGORY_SUCCESS:
            return { ...state, deviceCategoryList: action.payload, deviceCategoryLoader: false };
        case SHOW_DEVICE_CATEGORY_FAILED:
            return { ...state, deviceCategoryLoader: false };
        case SHOW_SENSOR_CATEGORY:
            return { ...state, sensorCategoryLoader: true };
        case SHOW_SENSOR_CATEGORY_SUCCESS:
            return { ...state, sensorCategoryList: action.payload, sensorCategoryLoader: false };
        case SHOW_SENSOR_CATEGORY_FAILED:
            return { ...state, sensorCategoryLoader: false };
        case GET_SENSOR_CATEGORY:
            return { ...state, sensorCategoryDropLoader: true };
        case GET_SENSOR_CATEGORY_SUCCESS:
            return { ...state, sensorCategory: action.payload, sensorCategoryDropLoader: false };
        case GET_SENSOR_CATEGORY_FAILED:
            return { ...state, sensorCategoryDropLoader: false };
        case SHOW_SENSOR:
            return { ...state, showSensorLoader: true };
        case SHOW_SENSOR_SUCCESS:
            return { ...state, showSensorList: action.payload, showSensorLoader: false };
        case SHOW_SENSOR_FAILED:
            return { ...state, showSensorLoader: false };
        case GET_SENSOR_CATEGORY_DROPDOWN_LIST:
            return { ...state, sensorCategoryDropdownListLoader: true };
        case GET_SENSOR_CATEGORY_DROPDOWN_LIST_SUCCESS:
            return { ...state, sensorCategoryDropdownList: action.payload, sensorCategoryDropdownListLoader: false };
        case GET_SENSOR_CATEGORY_DROPDOWN_LIST_FAILED:
            return { ...state, sensorCategoryDropdownListLoader: false };
        case GET_SENSOR_DROPDOWN_LIST:
            return { ...state, sensorDropdownListLoader: true };
        case GET_SENSOR_DROPDOWN_LIST_SUCCESS:
            return { ...state, sensorDropdownList: action.payload, sensorDropdownListLoader: false };
        case GET_SENSOR_DROPDOWN_LIST_FAILED:
            return { ...state, sensorDropdownListLoader: false };
        default:
            return state;
    }
};