import React, { useEffect } from 'react'
import InnerCardHeader from './InnerCardHeader';
import InnerCardBody from './InnerCardBody';
import { Link, useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import { machineProductionCount } from '../../../Actions'

const MainCardInnerPage = (props) => {
    const routeStateObject = useLocation();
    const { machine_id, currentDate, machine_Name, machineCardData } = routeStateObject.state;
    console.log(`machine id is ${machine_id} and date is ${currentDate} machine name is ${machine_Name}`)

    useEffect(() => {
        // props.machineProductionCount(
        //     {
        //         machineId: machine_id,
        //         cDate: currentDate
        //     }
        // )
    }, [machine_id, currentDate])

    return (
        <>
            {/* <InnerCardHeader
                machine_Name={machine_Name}
            /> */}
            <InnerCardBody machineId={machine_id}
                currentDate={currentDate}
                machineCardData={machineCardData}
            />
        </>
    )
}
// export default MainCardInnerPage;
const mapStateToProps = ({ }) => {
    // const { machineList, machineLoader } = config;
    return {}
}
export default connect(mapStateToProps, { machineProductionCount })(MainCardInnerPage);
