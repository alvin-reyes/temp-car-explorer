/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import {alpha, SxProps, Theme, useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { CarReader, CarWriter } from '@ipld/car';
import * as dagCbor from '@ipld/dag-cbor'
import * as dagPb from '@ipld/dag-pb'
import * as dagJson from '@ipld/dag-json'
import * as raw from 'multiformats/codecs/raw'
import * as json from 'multiformats/codecs/json'
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import functionLoader from 'images/loader.gif';
import {CID} from "@ipld/car/types/lib/iterator";
import { sha256 } from 'multiformats/hashes/sha2'
import { from as hasher } from 'multiformats/hashes/hasher'

interface Props {
  text: string;
}

const codecs = {
  [dagCbor.code]: dagCbor,
  [dagPb.code]: dagPb,
  [dagJson.code]: dagJson,
  [raw.code]: raw,
  [json.code]: json
}

const hashes = {
  [sha256.code]: sha256,
}

interface CarResult {
  version: String,
  rootCids: CID[],
  roots: String,
  blocks: {
    key: String,
    value: String,
  }[],
  cids: {
    hash: String,
    name: String,
    type: String,
    size: String,
  }[],
}

function decode (cid, bytes) {
  if (!codecs[cid.code]) {
    throw new Error(`Unknown codec code: 0x${cid.code.toString(16)}`)
  }
  return codecs[cid.code].decode(bytes)
}

export const timeout = async (delay) => {
  return new Promise(res => setTimeout(res, delay));
}

const Explore = ({text}:Props) : JSX.Element => {

  const theme = useTheme();
  const [data, setData] = React.useState('');
  const [file, setFile] = React.useState<File>();
  const [carResult, setCarResult] = React.useState<CarResult>();
  const [spinnerUpload, setSpinnerUpload] = React.useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];
    setFile(file);
  };

  const uploadWithFormData = async (event) => {
    event.preventDefault()
    setSpinnerUpload(functionLoader)
    let fReader = new FileReader();

    fReader.readAsArrayBuffer(file);
    fReader.onload = async() => {
      let uint8ArrayResult = new Uint8Array(fReader.result as ArrayBuffer);
      const reader = await CarReader.fromBytes(uint8ArrayResult);
      const roots = await reader.getRoots()
      const got = await reader.get(roots[0])

      let carResultValues = {
        version: reader.version.toString(),
        roots: (await reader.getRoots()).map((r) => r.toString()).join(', '),
        blocks: [],
        cids: [],
        rootCids:[]
      }
      console.log(`Version: ${reader.version}`)
      console.log(roots.forEach(r => console.log(r)))
      console.log(`Roots: [${(await reader.getRoots()).map((r) => r.toString()).join(', ')}]`)
      console.log('Blocks:')
      let i = 1
      for await (const { cid, bytes } of reader.blocks()) {
        const decoded = decode(cid, bytes)
        console.log(`#${i++} ${cid} [${codecs[cid.code].name}]`)
        console.log(new TextDecoder().decode(dagJson.encode(decoded)))
        carResultValues.blocks = [...carResultValues.blocks, {
          key: cid.toString(),
          value: new TextDecoder().decode(dagJson.encode(decoded)),
        }]
      }
      carResultValues.rootCids = await reader.getRoots()
      let data = carResultValues.blocks.find(b => b.key === carResultValues.roots).value
      let jsonData = JSON.parse(data);
      console.log(jsonData);
      carResultValues.cids = jsonData["Links"].map((l) => {
        return {
          hash: l["Hash"]["/"],
          name: l["Name"],
          size: l["Tsize"]
        }
      })
      console.log(carResultValues);
      setCarResult(carResultValues);
      setSpinnerUpload('')
    };


    fReader.onerror = function() {
      console.log(fReader.error);
    };
  };

  return (
      <Container >
    <Box>

        <Box>
            <Typography>
              <img
                  src='https://upload.wikimedia.org/wikipedia/commons/1/18/Ipfs-logo-1024-ice-text.png'
                  style={{
                    width: '50px',
                    filter:
                        theme.palette.mode === 'dark'
                            ? 'brightness(0.7)'
                            : 'none',
                  }}
              />
            </Typography>
          <Typography variant={'h4'} fontWeight={700}>
            Simple IPLD Car Explorer
          </Typography>
          <Typography>
            IPFS CAR Content-Addressed Archive Explorer
          </Typography>
          <Typography>
            Upload your CAR, explore the content.
          </Typography>
        </Box>

      &nbsp;&nbsp;
      <Divider />
      &nbsp;&nbsp;
      <form onSubmit={uploadWithFormData}>
        <input type="file" onChange={handleFileChange}  accept=".car" />
        <Button type="submit" variant="contained" color="primary">
          Upload
          {/*<Box component={'img'} src={spinnerUpload} height={20}  />*/}
        </Button>
      </form>
      &nbsp;&nbsp;
      {carResult && carResult.rootCids.map((cid) => {
        return (
            <Card
                variant={'outlined'}
                sx={{
                  borderRadius: 2,
                  boxShadow: 0,
                  bgcolor: 'background.paper',
                }}
            >
              <Box
                  padding={1}
                  bgcolor={alpha(theme.palette.divider, 0.03)}
                  display={'flex'}
                  justifyContent={'left'}
                  alignItems={'left'}
                  sx={{
                    '& img': {
                      borderRadius: 2,
                    },
                  }}
              >
                <Typography key={cid.toString()}>
                  CID:
                  <a href={`https://ipfs.io/ipfs/${cid.toString()}`} target="_blank" rel="noopener noreferrer">
                    {cid.toString()}
                  </a>
                </Typography>
              </Box>
              {/*<Box*/}
              {/*    padding={1}*/}
              {/*    bgcolor={alpha(theme.palette.divider, 0.03)}*/}
              {/*    display={'flex'}*/}
              {/*    justifyContent={'left'}*/}
              {/*    alignItems={'left'}*/}
              {/*    sx={{*/}
              {/*      '& img': {*/}
              {/*        borderRadius: 2,*/}
              {/*      },*/}
              {/*    }}*/}
              {/*>*/}
              {/*  <Typography key={cid.toString()}>*/}
              {/*    Multihash: {cid.multihash.code.toString(16)}*/}
              {/*  </Typography>*/}
              {/*</Box>*/}

              <Box
                  padding={1}
                  bgcolor={alpha(theme.palette.divider, 0.03)}
                  display={'flex'}
                  justifyContent={'left'}
                  alignItems={'left'}
                  sx={{
                    '& img': {
                      borderRadius: 2,
                    },
                  }}
              >
                Version: {carResult && carResult.version}

              </Box>

              <Box
                  padding={1}
                  bgcolor={alpha(theme.palette.divider, 0.03)}
                  display={'flex'}
                  justifyContent={'left'}
                  alignItems={'left'}
                  sx={{
                    '& img': {
                      borderRadius: 2,
                    },
                  }}
              >
                Links: {carResult && carResult.cids.length}

              </Box>

            </Card>

        )
      })}

      &nbsp;&nbsp;
      <Divider />

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 750, overflow:'scroll' }} aria-label="simple table" >
          <TableHead sx={{ bgcolor: 'alternate.dark' }}>
            <TableRow>
              <TableCell>
                <Typography
                    variant={'caption'}
                    fontWeight={700}
                    sx={{ textTransform: 'uppercase' }}
                >
                  Path/Name
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                    variant={'caption'}
                    fontWeight={700}
                    sx={{ textTransform: 'uppercase' }}
                >
                  CID
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                    variant={'caption'}
                    fontWeight={700}
                    sx={{ textTransform: 'uppercase' }}
                >
                  Size
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                    variant={'caption'}
                    fontWeight={700}
                    sx={{ textTransform: 'uppercase' }}
                >
                  Actions
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {carResult && carResult.cids.map((row,id) => (
                <TableRow key={id}>
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell>
                    <a href={'https://ipfs.io/ipfs/'+row.hash}>
                      {row.hash}
                    </a>
                  </TableCell>
                  <TableCell>
                    {row.size}
                  </TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" onClick={(event)=>{window.open("https://ipfs.io/ipfs/"+row.hash);}}>Download</Button>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

    </Box>
      </Container>
  );
};

export default Explore;
