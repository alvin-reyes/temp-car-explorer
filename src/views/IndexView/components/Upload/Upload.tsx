/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

interface Props {
  text: string;
}

const Upload = ({text}:Props): JSX.Element => {
  const theme = useTheme();
  const [data, setData] = React.useState<string>('Upload');
  text = data;
  return (
    <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Box
          >
            <Box display={'flex'} flexDirection={'column'}>
              <Box
                component={Avatar}
                width={50}
                height={50}
                marginBottom={2}
                bgcolor={theme.palette.primary.main}
                color={theme.palette.background.paper}
              >
                <Button onClick={() => {setData('aaaaa')}}>
                  <Typography variant={'h6'}>
                    Hello
                  </Typography>
                </Button>
              </Box>
              <Typography variant={'h6'} gutterBottom sx={{ fontWeight: 500 }}>

              </Typography>
              <Typography color="text.secondary"></Typography>
            </Box>
          </Box>
        </Grid>
    </Grid>
  );
};

export default Upload;
