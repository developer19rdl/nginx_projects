import { Box, Typography } from '@mui/material';

const NestingInfoTitle = (props) => {
    return (
        <Box
            sx={{
                mb: '10px',
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                marginLeft: '10px',
                marginRight: '10px'
            }}
        >
            <Typography
                sx={{ m: 1, fontFamily: 'Roboto Slab', fontWeight: 'bold' }}
                variant="h5"
            >
                Nesting Info
            </Typography>
        </Box>
    )
}

export default NestingInfoTitle;
