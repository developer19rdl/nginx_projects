import {
    EMPTY_PAYLOAD,
    EMPTY_EMAIL,
    POST,
    GET,
    PUT,
    MACHINE_PRODUCTION,
    MACHINE_PRODUCTION_SUCCESS,
    MACHINE_PRODUCTION_FAILED,
    SHOW_MACHINE,
    SHOW_MACHINE_SUCCESS,
    SHOW_MACHINE_FAILED,
    GET_FEEDER_ID
} from '../Actions/Type';

import {
    SET_API,
    KEWAUNEE_API_PATH
} from '../Services';

export const machineProductionCount = (PAYLOAD_DATA) => {
    console.log("PAYLOAD_DATA", PAYLOAD_DATA)
    return async (dispatch) => {
        dispatch({ type: MACHINE_PRODUCTION })
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            // const PAYLOAD_DATA = EMPTY_PAYLOAD

            const machineProductionCount = await SET_API(KEWAUNEE_API_PATH.MACHINE_PRODUCTION_COUNT, POST, PAYLOAD_DATA, HEADERS)
            if (machineProductionCount) {
                console.log("machineProductionCount", machineProductionCount.data)
                dispatch({ type: MACHINE_PRODUCTION_SUCCESS, payload: machineProductionCount.data })
            } else {
                dispatch({ type: MACHINE_PRODUCTION_FAILED })
                console.log("ERROR IF ELSE")
            }
        } catch (error) {
            console.log('ERROR', error.response.data.message)
            dispatch({ type: MACHINE_PRODUCTION_FAILED })
            return error
        }
    }
}

// NODE MAIN DASHBOAED
export const showDashboardMachine = (handleDashboardDataSucess = null, handleDashboardDataException = null) => {
    return async (dispatch) => {
        dispatch({ type: SHOW_MACHINE })
        try {
            const HEADERS = {
                USER_TOKEN: EMPTY_PAYLOAD,
                ID: EMPTY_PAYLOAD
            }
            const PAYLOAD_DATA = EMPTY_PAYLOAD

            const showMachine = await SET_API(KEWAUNEE_API_PATH.DASHBORAD_MACHINE_SHOW, GET, PAYLOAD_DATA, HEADERS)
            if (showMachine) {
                dispatch({ type: SHOW_MACHINE_SUCCESS, payload: showMachine.data })
                handleDashboardDataSucess()
            } else {
                dispatch({ type: SHOW_MACHINE_FAILED })
                handleDashboardDataException()
            }
        } catch (error) {
            dispatch({ type: SHOW_MACHINE_FAILED })
            return error
        }
    }
}


////////////////////

export const updateFeederId = (id) => {
    return async (dispatch) => {
        dispatch({ type : GET_FEEDER_ID,payload: id })
       
    }
}