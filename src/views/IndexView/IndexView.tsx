import React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Main from 'layouts/Main';
import Container from 'components/Container';
import {
  Explore,
  Upload,
} from './components';

const IndexView = (): JSX.Element => {
  const theme = useTheme();
  const [forUpload, setForUpload] = React.useState(false);
  let childRef = React.createRef();

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      <Main bgcolor={'background.paper'}>
        <Container>
          <Explore text={"sasas"}  />
        </Container>
      </Main>
    </Box>
  );
};

export default IndexView;
