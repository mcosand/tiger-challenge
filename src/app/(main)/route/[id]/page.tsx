'use client';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useAppDispatch, useAppSelector } from '@challenge/lib/client/store';
import { Typography } from '@mui/material';
import { RouteUserTrackStats } from '@challenge/types/api/routeUserTrackStats';
import { format } from 'date-fns';
import { formatDuration } from '@challenge/lib/formatting';

const columns: GridColDef[] = [
  { field: 'userName', headerName: 'Name', minWidth: 150 },
  {
    field: 'started',
    headerName: 'Start Time',
    minWidth: 150,
    valueGetter: t => format(t.value, `HHmm MMM dd yyyy`),
  },
  {
    field: 'up.time',
    headerName: 'Time to Top',
    minWidth: 150,
    valueGetter: p => formatDuration(p.row.up.time),
  }
];

export default function RoutePage({ params }: { params: { id: string } }) {
  const dispatch = useAppDispatch();
  //const router = useRouter();
  const user = useAppSelector(state => state.auth.userInfo);
  const [ tracks, setTracks ] = useState<{list: RouteUserTrackStats[] }>();

  useEffect(() => {
    fetch(`/api/v1/routes/${params.id}/tracks`).then(response => response.json()).then(setTracks);
  }, [params.id]);

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper', padding: 2 }}>
      <Typography variant="h5" sx={{ mb: 1 }}>Reported Times</Typography>
      { tracks ? (
      <DataGrid
        sx={{height: 400}}
        rows={tracks?.list ?? []}
        columns={columns}
        disableRowSelectionOnClick
      />
      ) : <div>Loading ...</div>}
    </Box>
  );
}