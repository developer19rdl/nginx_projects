// "use strict";

import { combineReducers } from "redux";
import ConfigReducer from "./ConfigReducer";
import LoadSchedule from "./LoadSchedule";
import MainDashboardReducer from "./MainDashboardReducer";
import MachineParaAllocationReducer from "./MachineParaAllocationReducer";

export default combineReducers({
    config: ConfigReducer,
    LoadSchedule: LoadSchedule,
    MainDashboardReducer: MainDashboardReducer,
    MachineParaAllocationReducer: MachineParaAllocationReducer
})