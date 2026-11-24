import {
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

const INITIAL_STATE = {
    loadScheduleLoader: false,
    loadScheduleList: [],
    showLoadScheduleLoader: false,
    showLoadScheduleList: [],
    reScheduleListLoader: false,
    reScheduleList: []
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case SCHEDULE_MACHINE_LIST:
            return { ...state, loadScheduleLoader: true };
        case SCHEDULE_MACHINE_LIST_SUCCESS:
            return { ...state, loadScheduleList: action.payload, loadScheduleLoader: false };
        case SCHEDULE_MACHINE_LIST_FAILED:
            return { ...state, loadScheduleLoader: false };
        case SHOW_LOAD_SCHEDULE:
            return { ...state, showLoadScheduleLoader: true };
        case SHOW_LOAD_SCHEDULE_SUCCESS:
            return { ...state, showLoadScheduleList: action.payload, showLoadScheduleLoader: false };
        case SHOW_LOAD_SCHEDULE_FAILED:
            return { ...state, showLoadScheduleLoader: false };
        case RE_SCHEDULED_LIST:
            return { ...state, reScheduleListLoader: true };
        case RE_SCHEDULED_LIST_SUCCESS:
            return { ...state, reScheduleList: action.payload, reScheduleListLoader: false };
        case RE_SCHEDULED_LIST_FAILED:
            return { ...state, reScheduleListLoader: false };
        default:
            return state;
    }
};