import {
    EMPTY_PAYLOAD,
    EMPTY_EMAIL,
    POST,
    GET,
    PUT,
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
    GET_SENSOR_CATEGORY_DROPDOWN_LIST_FAILED,
    GET_MACHINE_DROPDOWN_LIST,
    GET_MACHINE_DROPDOWN_LIST_SUCCESS,
    GET_MACHINE_DROPDOWN_LIST_FAILED,



} from '../Actions/Type';

import {
    SET_API,
    KEWAUNEE_API_PATH
} from '../Services';

// Edge Device Add API
export const addEdgeDevice = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const addEdgeDevice = await SET_API(KEWAUNEE_API_PATH.ADD_EDGE_DEVICE, POST, PAYLOAD_DATA, HEADERS)
            if (addEdgeDevice) {
                Success(addEdgeDevice);
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

export const showEdgeDevices = () => {
    return async (dispatch) => {
        dispatch({ type: SHOW_EDGE_DEVICE })
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const PAYLOAD_DATA = EMPTY_PAYLOAD

            const showEdgeDevices = await SET_API(KEWAUNEE_API_PATH.EDGE_DEVICE_SHOW, GET, PAYLOAD_DATA, HEADERS)
            if (showEdgeDevices) {
                dispatch({ type: SHOW_EDGE_DEVICE_SUCCESS, payload: showEdgeDevices.data })
            } else {
                dispatch({ type: SHOW_EDGE_DEVICE_FAILED })
            }
        } catch (error) {
            dispatch({ type: SHOW_EDGE_DEVICE_FAILED })
            return error
        }
    }
}

export const editEdgeDevices = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }

            const editEdgeDevices = await SET_API(KEWAUNEE_API_PATH.EDGE_DEVICE_EDIT + PAYLOAD_DATA.id + '/update', POST, PAYLOAD_DATA, HEADERS)
            if (editEdgeDevices) {
                Success(editEdgeDevices)
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

export const deleteEdgeDevices = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }

            const deleteEdgeDevices = await SET_API(KEWAUNEE_API_PATH.EDGE_DEVICE_DELETE + PAYLOAD_DATA.id + '/delete', POST, PAYLOAD_DATA, HEADERS)
            if (deleteEdgeDevices) {
                Success(deleteEdgeDevices)
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

// Device Category Add API
export const addDeviceCategory = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const addDeviceCategory = await SET_API(KEWAUNEE_API_PATH.ADD_DEVICE_CATEGORY, POST, PAYLOAD_DATA, HEADERS)
            if (addDeviceCategory) {
                Success(addDeviceCategory);
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

export const showDeviceCategory = () => {
    return async (dispatch) => {
        dispatch({ type: SHOW_DEVICE_CATEGORY })
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const PAYLOAD_DATA = EMPTY_PAYLOAD

            const showDeviceCategory = await SET_API(KEWAUNEE_API_PATH.DEVICE_CATEGORY_SHOW, GET, PAYLOAD_DATA, HEADERS)
            if (showDeviceCategory) {
                dispatch({ type: SHOW_DEVICE_CATEGORY_SUCCESS, payload: showDeviceCategory.data })
            } else {
                dispatch({ type: SHOW_DEVICE_CATEGORY_FAILED })
            }
        } catch (error) {
            dispatch({ type: SHOW_DEVICE_CATEGORY_FAILED })
            return error
        }
    }
}

export const editDeviceCategory = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }

            const editDeviceCategory = await SET_API(KEWAUNEE_API_PATH.DEVICE_CATEGORY_EDIT + PAYLOAD_DATA.id + '/update', POST, PAYLOAD_DATA, HEADERS)
            if (editDeviceCategory) {
                Success(editDeviceCategory)
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

export const deleteDeviceCategory = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }

            const deleteEdgeDevices = await SET_API(KEWAUNEE_API_PATH.DEVICE_CATEGORY_DELETE + PAYLOAD_DATA.id + '/delete', POST, PAYLOAD_DATA, HEADERS)
            if (deleteEdgeDevices) {
                Success(deleteEdgeDevices)
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

// Sensor Category Add API
export const addSensorCategory = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const addSensorCategory = await SET_API(KEWAUNEE_API_PATH.ADD_SENSOR_CATEGORY, POST, PAYLOAD_DATA, HEADERS)
            if (addSensorCategory) {
                Success(addSensorCategory);
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

export const showSensorCategory = () => {
    return async (dispatch) => {
        dispatch({ type: SHOW_SENSOR_CATEGORY })
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const PAYLOAD_DATA = EMPTY_PAYLOAD

            const showSensorCategory = await SET_API(KEWAUNEE_API_PATH.SENSOR_CATEGORY_SHOW, GET, PAYLOAD_DATA, HEADERS)
            if (showSensorCategory) {
                dispatch({ type: SHOW_SENSOR_CATEGORY_SUCCESS, payload: showSensorCategory.data })
            } else {
                dispatch({ type: SHOW_SENSOR_CATEGORY_FAILED })
            }
        } catch (error) {
            dispatch({ type: SHOW_SENSOR_CATEGORY_FAILED })
            return error
        }
    }
}

export const editSensorCategory = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }

            const editSensorCategory = await SET_API(KEWAUNEE_API_PATH.SENSOR_CATEGORY_EDIT + PAYLOAD_DATA.id + '/update', POST, PAYLOAD_DATA, HEADERS)
            if (editSensorCategory) {
                Success(editSensorCategory)
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

export const deleteSensorCategory = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }

            const deleteSensorCategory = await SET_API(KEWAUNEE_API_PATH.SENSOR_CATEGORY_DELETE + PAYLOAD_DATA.id + '/delete', POST, PAYLOAD_DATA, HEADERS)
            if (deleteSensorCategory) {
                Success(deleteSensorCategory)
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

// Sensor Add API

export const getSensorCategory = () => {
    return async (dispatch) => {
        dispatch({ type: GET_SENSOR_CATEGORY })
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const PAYLOAD_DATA = EMPTY_PAYLOAD

            const getSensorCategory = await SET_API(KEWAUNEE_API_PATH.GET_SENSOR_CATEGORY, GET, PAYLOAD_DATA, HEADERS)
            if (getSensorCategory) {
                dispatch({ type: GET_SENSOR_CATEGORY_SUCCESS, payload: getSensorCategory.data })
            } else {
                dispatch({ type: GET_SENSOR_CATEGORY_FAILED })
            }
        } catch (error) {
            dispatch({ type: GET_SENSOR_CATEGORY_FAILED })
            return error
        }
    }
}

export const addSensor = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const addSensor = await SET_API(KEWAUNEE_API_PATH.ADD_SENSOR, POST, PAYLOAD_DATA, HEADERS)
            if (addSensor) {
                Success(addSensor);
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

export const showSensor = () => {
    return async (dispatch) => {
        dispatch({ type: SHOW_SENSOR })
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const PAYLOAD_DATA = EMPTY_PAYLOAD

            const showSensor = await SET_API(KEWAUNEE_API_PATH.SHOW_SENSOR, GET, PAYLOAD_DATA, HEADERS)
            if (showSensor) {
                dispatch({ type: SHOW_SENSOR_SUCCESS, payload: showSensor.data })
            } else {
                dispatch({ type: SHOW_SENSOR_FAILED })
            }
        } catch (error) {
            dispatch({ type: SHOW_SENSOR_FAILED })
            return error
        }
    }
}

export const editSensor = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }

            const editSensor = await SET_API(KEWAUNEE_API_PATH.SENSOR_EDIT + PAYLOAD_DATA.id + '/update', POST, PAYLOAD_DATA, HEADERS)
            if (editSensor) {
                Success(editSensor)
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

export const deleteSensor = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }

            const deleteSensor = await SET_API(KEWAUNEE_API_PATH.SENSOR_DELETE + PAYLOAD_DATA.id + '/delete', POST, PAYLOAD_DATA, HEADERS)
            if (deleteSensor) {
                Success(deleteSensor)
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

//Deploy sensor api
export const getSensorCategoryDropdownList = () => {
    return async (dispatch) => {
        dispatch({ type: GET_SENSOR_CATEGORY_DROPDOWN_LIST })
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const PAYLOAD_DATA = EMPTY_PAYLOAD

            const getSensorCategoryDropdownList = await SET_API(KEWAUNEE_API_PATH.GET_SENSOR_CATEGORY_LIST, GET, PAYLOAD_DATA, HEADERS)
            if (getSensorCategoryDropdownList) {
                console.log("getSensorCategoryDropdownList", getSensorCategoryDropdownList)
                dispatch({ type: GET_SENSOR_CATEGORY_DROPDOWN_LIST_SUCCESS, payload: getSensorCategoryDropdownList.data })
            } else {
                dispatch({ type: GET_SENSOR_CATEGORY_DROPDOWN_LIST_FAILED })
            }
        } catch (error) {
            dispatch({ type: GET_SENSOR_CATEGORY_DROPDOWN_LIST_FAILED })
            return error
        }
    }
}

export const getSensorDetailsDropdownList = (ID) => {
    return async (dispatch) => {
        dispatch({ type: GET_SENSOR_DROPDOWN_LIST })
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }

            const PAYLOAD_DATA = EMPTY_PAYLOAD;

            const getSensorDetailsDropdownList = await SET_API(KEWAUNEE_API_PATH.GET_SENSOR_UNIT_LIST + ID + '/list', GET, PAYLOAD_DATA, HEADERS)
            if (getSensorDetailsDropdownList) {
                console.log("getSensorDetailsDropdownList", getSensorDetailsDropdownList)
                dispatch({ type: GET_SENSOR_DROPDOWN_LIST_SUCCESS, payload: getSensorDetailsDropdownList.data })
            } else {
                dispatch({ type: GET_SENSOR_DROPDOWN_LIST_FAILED })
            }
        } catch (error) {
            dispatch({ type: GET_SENSOR_DROPDOWN_LIST_FAILED })
            return error
        }
    }
}

export const deploySensorAdd = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const addSensor = await SET_API(KEWAUNEE_API_PATH.DEPLOY_SENSOR_ADD, POST, PAYLOAD_DATA, HEADERS)
            if (addSensor) {
                Success(addSensor);
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}


export const getMachineDropdownList = (ID) => {
    return async (dispatch) => {
        dispatch({ type: GET_MACHINE_DROPDOWN_LIST })
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }

            const PAYLOAD_DATA = EMPTY_PAYLOAD;

            const getMachineDropdownList = await SET_API(KEWAUNEE_API_PATH.GET_MACHINE_LIST + ID + '/list', GET, PAYLOAD_DATA, HEADERS)
            if (getMachineDropdownList) {
                console.log("getMachineDropdownList", getMachineDropdownList)
                dispatch({ type: GET_MACHINE_DROPDOWN_LIST_SUCCESS, payload: getMachineDropdownList.data })
            } else {
                dispatch({ type: GET_MACHINE_DROPDOWN_LIST_FAILED })
            }
        } catch (error) {
            dispatch({ type: GET_MACHINE_DROPDOWN_LIST_FAILED })
            return error
        }
    }
}
