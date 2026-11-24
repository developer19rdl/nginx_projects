import {
    EMPTY_PAYLOAD,
    EMPTY_EMAIL,
    POST,
    GET,
    PUT,
    ADD_LOAD_SCHEDULE,
    ADD_LOAD_SCHEDULE_SUCCESS,
    ADD_LOAD_SCHEDULE_FAILED,
    SCHEDULE_MACHINE_LIST,
    SCHEDULE_MACHINE_LIST_SUCCESS,
    SCHEDULE_MACHINE_LIST_FAILED,
    SHOW_LOAD_SCHEDULE,
    SHOW_LOAD_SCHEDULE_SUCCESS,
    SHOW_LOAD_SCHEDULE_FAILED,
    RE_SCHEDULED_LIST,
    RE_SCHEDULED_LIST_SUCCESS,
    RE_SCHEDULED_LIST_FAILED
} from '../Actions/Type';

import {
    SET_API,
    KEWAUNEE_API_PATH
} from '../Services';

export const getLoadScheduleMachineList = () => {
    return async (dispatch) => {
        dispatch({ type: SCHEDULE_MACHINE_LIST })
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const PAYLOAD_DATA = EMPTY_PAYLOAD

            const getLoadScheduleMachineList = await SET_API(KEWAUNEE_API_PATH.LOAD_SCHEDULE_MACHINE_LIST, GET, PAYLOAD_DATA, HEADERS)
            if (getLoadScheduleMachineList) {
                dispatch({ type: SCHEDULE_MACHINE_LIST_SUCCESS, payload: getLoadScheduleMachineList.data })
            } else {
                dispatch({ type: SCHEDULE_MACHINE_LIST_FAILED })
            }
        } catch (error) {
            dispatch({ type: SCHEDULE_MACHINE_LIST_FAILED })
            return error
        }
    }
}

export const addLoadSchedule = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const addLoadSchedule = await SET_API(KEWAUNEE_API_PATH.LOAD_SCHEDULE_ADD, POST, PAYLOAD_DATA, HEADERS)
            if (addLoadSchedule) {
                Success(addLoadSchedule);
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

export const showLoadSchedule = () => {
    return async (dispatch) => {
        dispatch({ type: SHOW_LOAD_SCHEDULE })
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const PAYLOAD_DATA = EMPTY_PAYLOAD

            const showLoadSchedule = await SET_API(KEWAUNEE_API_PATH.LOAD_SCHEDULE_SHOW, GET, PAYLOAD_DATA, HEADERS)
            if (showLoadSchedule) {
                dispatch({ type: SHOW_LOAD_SCHEDULE_SUCCESS, payload: showLoadSchedule.data })
            } else {
                dispatch({ type: SHOW_LOAD_SCHEDULE_FAILED })
            }
        } catch (error) {
            dispatch({ type: SHOW_LOAD_SCHEDULE_FAILED })
            return error
        }
    }
}

export const editLoadSchedule = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }

            const editLoadSchedule = await SET_API(KEWAUNEE_API_PATH.LOAD_SCHEDULE_EDIT + PAYLOAD_DATA.id + '/update', POST, PAYLOAD_DATA, HEADERS)
            if (editLoadSchedule) {
                Success(editLoadSchedule)
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

export const deleteLoadSchedule = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }

            const deleteCapacityMeasure = await SET_API(KEWAUNEE_API_PATH.LOAD_SCHEDULE_DELETE + PAYLOAD_DATA.id + '/delete', POST, PAYLOAD_DATA, HEADERS)
            if (deleteCapacityMeasure) {
                Success(deleteCapacityMeasure)
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

export const reSchedule = (PAYLOAD_DATA, Success, Failure) => {
    return async (dispatch) => {
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }

            const reSchedule = await SET_API(KEWAUNEE_API_PATH.RE_SCHEDULE + PAYLOAD_DATA.id + '/Reschedule', POST, PAYLOAD_DATA, HEADERS)
            if (reSchedule) {
                Success(reSchedule)
            }
        } catch (error) {
            Failure('ERROR', error.response.data.message)
            return error
        }
    }
}

export const reScheduledList = () => {
    return async (dispatch) => {
        dispatch({ type: RE_SCHEDULED_LIST })
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const PAYLOAD_DATA = EMPTY_PAYLOAD

            const reScheduledList = await SET_API(KEWAUNEE_API_PATH.RE_SCHEDULED_LIST, GET, PAYLOAD_DATA, HEADERS)
            if (reScheduledList) {
                dispatch({ type: RE_SCHEDULED_LIST_SUCCESS, payload: reScheduledList.data })
            } else {
                dispatch({ type: RE_SCHEDULED_LIST_FAILED })
            }
        } catch (error) {
            dispatch({ type: RE_SCHEDULED_LIST_FAILED })
            return error
        }
    }
}