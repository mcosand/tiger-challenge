'use client';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useAppDispatch, useAppSelector } from '@challenge/lib/client/store';
import { Typography } from '@mui/material';

const columns: GridColDef[] = [
  { field: 'mapId', headerName: 'ID', width: 90, renderCell: p => (<a href={`https://caltopo.com/m/${p.value}`} target="_blank">{p.value}</a>) },
  {
    field: 'title',
    headerName: 'Title',
    width: 300,
  },
];

export default function UserPage() {
  const dispatch = useAppDispatch();
  //const router = useRouter();
  const user = useAppSelector(state => state.auth.userInfo);
  const [ data, setData ] = useState<{list: { title: string }[] }>();
  const [ tracks, setTracks ] = useState<{list: { title: string }[] }>();

  useEffect(() => {
    fetch('/api/v1/my/maps').then(response => response.json()).then(setData);
    fetch('/api/v1/my/tracks').then(response => response.json()).then(setTracks);
  }, []);

  return (
    <div>
      <div>me page {user?.name}</div>
      <Box sx={{ width: '100%', mb: 2 }}>
        <Typography variant="h5">My Tracks</Typography>
        <DataGrid
          sx={{height: 400}}
          rows={tracks?.list ?? []}
          columns={columns}
          getRowId={f => f.mapId}
          disableRowSelectionOnClick
        />
      </Box>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5">My Maps</Typography>
        <DataGrid
          sx={{ height: 400 }}
          rows={data?.list ?? []}
          columns={columns}
          getRowId={f => f.mapId}
          disableRowSelectionOnClick
        />
      </Box>
    </div>
  )
}