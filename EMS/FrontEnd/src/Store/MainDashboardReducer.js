import {
    MACHINE_PRODUCTION,
    MACHINE_PRODUCTION_SUCCESS,
    MACHINE_PRODUCTION_FAILED,
    GET_FEEDER_ID
} from '../Actions/Type';

const INITIAL_STATE = {
    machineProdLoader: false,
    machineProdCount: [],
    feederId:''
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case MACHINE_PRODUCTION:
            return { ...state, machineProdLoader: true };
        case MACHINE_PRODUCTION_SUCCESS:
            return { ...state, machineProdCount: action.payload, machineProdLoader: false };
        case MACHINE_PRODUCTION_FAILED:
            return { ...state, machineProdLoader: false };
        case GET_FEEDER_ID:
            return { ...state, feederId: action.payload };
        default:
            return state;
    }
};