import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box';
import SmallCard from './MainDashSubComponent/SmallCard';
import BigCard from './MainDashSubComponent/BigCard';

export const MainDashboard = () => {
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        setCurrentDate(new Date().toISOString().split('T')[0]);
    }, [])

    return (
        <>
            <Box margin={2}>
                <SmallCard
                    setCurrentDate={setCurrentDate}
                    currentDate={currentDate}
                />
                <BigCard
                    currentDate={currentDate}
                />
            </Box>
        </>
    )
}
