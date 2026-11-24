import React,{useEffect} from 'react'
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

import '../EnergyMonitoring/EnergyMonitoring.css'
import tower from '../../Assets/Images/tower.png'

import Generator from '../../Assets/Images/generator2.png'

import { Gauge } from './EnergySubComponent/gauge';
import  TopEnergyCard  from './EnergySubComponent/TopEnergyCard';
import  DownEnergyCard  from './EnergySubComponent/DownEnergyCard';
import  Down3EnergyCard  from './EnergySubComponent/Down3EnergyCard';
import { UpdatedDownCard } from './EnergySubComponent/UpdatedDownCard';



export const EnergyMonitoring = ({ tabPanelName, tabList, setValue, plantId,callBackPlantName,/*FeederName*/ }) => {
    const customGaugeStyles = {
        backgroundColor: 'transparent',
        width: '200px',
        height: '200px',
    };

    useEffect(()=>{
        callBackPlantName(tabPanelName)
    },[])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', margin: '15px', marginTop: '-23px' }}>
            <TopEnergyCard
                tabPanelName={tabPanelName}
                plantId={plantId}
            />
            <DownEnergyCard
                tabPanelName={tabPanelName}
                plantId={plantId}
            />
            <Down3EnergyCard
                tabPanelName={tabPanelName}
                tabList={tabList}
                setValue={setValue}
                plantId={plantId}
                // FeederName={FeederName}
            />
        </div>
    )
}
