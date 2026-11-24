import { Box } from '@mui/material'
import React from 'react'
import SmallCard from '../MainDashboard/MainDashSubComponent/SmallCard'
import { HealthBigCard } from './SubHealthCard/HealthBigCard '


const HealthDashboardComponent = () => {
    return (
        // <Box marginTop={"5px"} marginLeft={"1%"} marginRight={"1%"}></Box>
        <Box margin={2}>
            {/* <div style={{ margin: '15px 15px 0 15px' }}> */}
            <SmallCard />
            {/* </div> */}
            <HealthBigCard />
        </Box>

    )
}

export default HealthDashboardComponent