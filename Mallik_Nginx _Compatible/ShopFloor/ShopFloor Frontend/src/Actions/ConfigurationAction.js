import {
    EMPTY_PAYLOAD,
    EMPTY_EMAIL,
    POST,
    GET,
    PUT,
    INFO_FETCH,
    ADD_UNIT_MASTER,
    ADD_UNIT_MASTER_SUCCESS,
    ADD_UNIT_MASTER_FAILED,
    ADD_CAPACITY_MEASURE_TYPE,
    ADD_CAPACITY_MEASURE_TYPE_SUCCESS,
    ADD_CAPACITY_MEASURE_TYPE_FAILED,
    SHOW_CAPACITY_MEASURE_TYPE,
    SHOW_CAPACITY_MEASURE_TYPE_SUCCESS,
    SHOW_CAPACITY_MEASURE_TYPE_FAILED,
    ADD_DEPARTMENT,
    ADD_DEPARTMENT_SUCCESS,
    ADD_DEPARTMENT_FAILED,
    SHOW_DEPARTMENT,
    SHOW_DEPARTMENT_SUCCESS,
    SHOW_DEPARTMENT_FAILED,
    EDIT_DEPARTMENT,
    EDIT_DEPARTMENT_SUCCESS,
    EDIT_DEPARTMENT_FAILED,
    DELETE_DEPARTMENT,
    DELETE_DEPARTMENT_SUCCESS,
    DELETE_DEPARTMENT_FAILED,
    ADD_MACHINE,
    ADD_MACHINE_SUCCESS,
    ADD_MACHINE_FAILED,
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

import {
    SET_API,
    KEWAUNEE_API_PATH
} from '../Services';

export const changeUserName = () => {
    const name = "developer";
    return async (dispatch) => {
        dispatch({ type: INFO_FETCH, payload: name })
    }
}

export const addUnit = (PAYLOAD_DATA) => {
    return async (dispatch) => {
        // dispatch({ type: ADD_UNIT_MASTER })
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const addUnit = await SET_API(KEWAUNEE_API_PATH.ADD_UNIT, POST, PAYLOAD_DATA, HEADERS)
            if (addUnit) {

                // dispatch({ type: ADD_UNIT_MASTER_SUCCESS, payload: userInfo })
            } else {
                // dispatch({ type: ADD_UNIT_MASTER_FAILED })
            }
        } catch (error) {
            // dispatch({ type: USER_SIGN_IN_FAILED })
            return error
        }
    }
}

// CAPACITY MEASURE API
export const addCapacityMeasure = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const addCapacityMeasure = await SET_API(KEWAUNEE_API_PATH.ADD_CAPACITY_MEASURE, POST, PAYLOAD_DATA, HEADERS)
            if (addCapacityMeasure) {
                Success(addCapacityMeasure);
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

export const showCapacityMeasure = () => {
    return async (dispatch) => {
        dispatch({ type: SHOW_CAPACITY_MEASURE_TYPE })
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const PAYLOAD_DATA = EMPTY_PAYLOAD

            const showCapacityMeasure = await SET_API(KEWAUNEE_API_PATH.CAPACITY_MEASURE_SHOW, GET, PAYLOAD_DATA, HEADERS)
            if (showCapacityMeasure) {
                dispatch({ type: SHOW_CAPACITY_MEASURE_TYPE_SUCCESS, payload: showCapacityMeasure.data })
            } else {
                dispatch({ type: SHOW_CAPACITY_MEASURE_TYPE_FAILED })
            }
        } catch (error) {
            dispatch({ type: SHOW_CAPACITY_MEASURE_TYPE_FAILED })
            return error
        }
    }
}

export const editCapacityMeasure = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }

            const editCapacityMeasure = await SET_API(KEWAUNEE_API_PATH.CAPACITY_MEASURE_EDIT + PAYLOAD_DATA.id + '/update', POST, PAYLOAD_DATA, HEADERS)
            if (editCapacityMeasure) {
                Success(editCapacityMeasure)
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

export const deleteCapacityMeasure = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }

            const deleteCapacityMeasure = await SET_API(KEWAUNEE_API_PATH.CAPACITY_MEASURE_DELETE + PAYLOAD_DATA.id + '/delete', POST, PAYLOAD_DATA, HEADERS)
            if (deleteCapacityMeasure) {
                Success(deleteCapacityMeasure)
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

//DEPARTMENT ADD API
export const addDepartment = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const addCapacityMeasure = await SET_API(KEWAUNEE_API_PATH.DEPARTMENT_ADD, POST, PAYLOAD_DATA, HEADERS)
            if (addCapacityMeasure) {
                Success(addCapacityMeasure);
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

export const showDepartment = () => {
    return async (dispatch) => {
        dispatch({ type: SHOW_DEPARTMENT })
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const PAYLOAD_DATA = EMPTY_PAYLOAD

            const showDepartment = await SET_API(KEWAUNEE_API_PATH.DEPARTMENT_SHOW, GET, PAYLOAD_DATA, HEADERS)
            if (showDepartment) {
                dispatch({ type: SHOW_DEPARTMENT_SUCCESS, payload: showDepartment.data })
            } else {
                dispatch({ type: SHOW_DEPARTMENT_FAILED })
            }
        } catch (error) {
            dispatch({ type: SHOW_DEPARTMENT_FAILED })
            return error
        }
    }
}

export const editDepartment = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const editDepartment = await SET_API(KEWAUNEE_API_PATH.DEPARTMENT_EDIT + PAYLOAD_DATA.id + '/update', POST, PAYLOAD_DATA, HEADERS)
            if (editDepartment) {
                Success(editDepartment)
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

export const deleteDepartment = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const deleteDepartment = await SET_API(KEWAUNEE_API_PATH.DEPARTMENT_DELETE + PAYLOAD_DATA.id + '/delete', POST, PAYLOAD_DATA, HEADERS)
            if (deleteDepartment) {
                Success(deleteDepartment);
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

// ADD MACHINE API INTEGRATION
export const addMachine = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const addMachine = await SET_API(KEWAUNEE_API_PATH.MACHINE_ADD, POST, PAYLOAD_DATA, HEADERS)
            if (addMachine) {
                Success(addMachine);
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

export const showMachine = () => {
    return async (dispatch) => {
        dispatch({ type: SHOW_MACHINE })
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const PAYLOAD_DATA = EMPTY_PAYLOAD

            const showMachine = await SET_API(KEWAUNEE_API_PATH.MACHINE_SHOW, GET, PAYLOAD_DATA, HEADERS)
            if (showMachine) {
                dispatch({ type: SHOW_MACHINE_SUCCESS, payload: showMachine.data })
            } else {
                dispatch({ type: SHOW_MACHINE_FAILED })
            }
        } catch (error) {
            dispatch({ type: SHOW_MACHINE_FAILED })
            return error
        }
    }
}

export const editMachine = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }

            const editDepartment = await SET_API(KEWAUNEE_API_PATH.MACHINE_EDIT + PAYLOAD_DATA.id + '/update', POST, PAYLOAD_DATA, HEADERS)
            if (editDepartment) {
                Success(editDepartment)
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

export const deleteMachine = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }

            const deleteDepartment = await SET_API(KEWAUNEE_API_PATH.MACHINE_DELETE + PAYLOAD_DATA.id + '/delete', POST, PAYLOAD_DATA, HEADERS)
            if (deleteDepartment) {
                Success(deleteDepartment);
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

// CREATE EVENT API INTEGRATION
export const createEvent = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const createEvent = await SET_API(KEWAUNEE_API_PATH.CREATE_EVENT, POST, PAYLOAD_DATA, HEADERS)
            if (createEvent) {
                Success(createEvent);
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

export const showCreatedEvent = () => {
    return async (dispatch) => {
        dispatch({ type: SHOW_CREATED_EVENT })
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const PAYLOAD_DATA = EMPTY_PAYLOAD

            const showCreatedEvent = await SET_API(KEWAUNEE_API_PATH.CREATED_EVENT_SHOW, GET, PAYLOAD_DATA, HEADERS)
            if (showCreatedEvent) {
                dispatch({ type: SHOW_CREATED_EVENT_SUCCESS, payload: showCreatedEvent.data })
            } else {
                dispatch({ type: SHOW_CREATED_EVENT_FAILED })
            }
        } catch (error) {
            dispatch({ type: SHOW_CREATED_EVENT_FAILED })
            return error
        }
    }
}

export const editCreatedEvent = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }

            const editCreatedEvent = await SET_API(KEWAUNEE_API_PATH.CREATED_EVENT_EDIT + PAYLOAD_DATA.id + '/update', POST, PAYLOAD_DATA, HEADERS)
            if (editCreatedEvent) {
                Success(editCreatedEvent)
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

export const deleteCreatedEvent = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }

            const deleteCreatedEvent = await SET_API(KEWAUNEE_API_PATH.CREATED_EVENT_DELETE + PAYLOAD_DATA.id + '/delete', POST, PAYLOAD_DATA, HEADERS)
            if (deleteCreatedEvent) {
                Success(deleteCreatedEvent);
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

//OEE PARAMETERS ADD
export const addOeeParameters = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const addOeeParameters = await SET_API(KEWAUNEE_API_PATH.ADD_OEE_PARAMETERS, POST, PAYLOAD_DATA, HEADERS)
            if (addOeeParameters) {
                Success(addOeeParameters);
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

export const showOeeParameter = () => {
    return async (dispatch) => {
        dispatch({ type: SHOW_OEE_PARAMETER })
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const PAYLOAD_DATA = EMPTY_PAYLOAD

            const showOeeParameter = await SET_API(KEWAUNEE_API_PATH.SHOW_OEE_PARAMETER, GET, PAYLOAD_DATA, HEADERS)
            if (showOeeParameter) {
                dispatch({ type: SHOW_OEE_PARAMETER_SUCCESS, payload: showOeeParameter.data })
            } else {
                dispatch({ type: SHOW_OEE_PARAMETER_FAILED })
            }
        } catch (error) {
            dispatch({ type: SHOW_OEE_PARAMETER_FAILED })
            return error
        }
    }
}

export const editOeeParameter = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }

            const editOeeParameter = await SET_API(KEWAUNEE_API_PATH.OEE_PARAMETER_EDIT + PAYLOAD_DATA.id + '/update', POST, PAYLOAD_DATA, HEADERS)
            if (editOeeParameter) {
                Success(editOeeParameter)
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

export const deleteOeeParameter = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }

            const deleteOeeParameter = await SET_API(KEWAUNEE_API_PATH.OEE_PARAMETER_DELETE + PAYLOAD_DATA.id + '/delete', POST, PAYLOAD_DATA, HEADERS)
            if (deleteOeeParameter) {
                Success(deleteOeeParameter);
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

//UPLOAD COMPANY LOGO
export const uploadCompanyLogo = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const uploadCompanyLogo = await SET_API(KEWAUNEE_API_PATH.UPLOAD_COMPANY_LOGO, POST, PAYLOAD_DATA, HEADERS)
            if (uploadCompanyLogo) {
                Success(uploadCompanyLogo);
                console.log("uploadCompanyLogo", uploadCompanyLogo)
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            console.log('ERROR', error.response.data.message)
            return error
        }
    }
}

export const getCompanyDetails = () => {
    return async (dispatch) => {
        dispatch({ type: SHOW_COMPANY_DETAILS })
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const PAYLOAD_DATA = EMPTY_PAYLOAD

            const getCompanyDetails = await SET_API(KEWAUNEE_API_PATH.GET_COMPANY_DETAILS, GET, PAYLOAD_DATA, HEADERS)
            if (getCompanyDetails) {
                dispatch({ type: SHOW_COMPANY_DETAILS_SUCCESS, payload: getCompanyDetails.data })
            } else {
                dispatch({ type: SHOW_COMPANY_DETAILS_FAILED })
            }
        } catch (error) {
            dispatch({ type: SHOW_COMPANY_DETAILS_FAILED })
            return error
        }
    }
}
