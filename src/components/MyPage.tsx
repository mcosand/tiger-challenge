'use client';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import SyncIcon from '@mui/icons-material/Sync';
import { DataGrid, GridActionsCellItem, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { useAppSelector } from '@challenge/lib/client/store';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { format } from 'date-fns';
import { formatDuration } from '@challenge/lib/formatting';
import { CalTopoMapField } from './CalTopoMapField';

const tracksColumns: GridColDef[] = [
  { field: 'mapId', headerName: 'Map ID', width: 90, renderCell: p => (<a href={`https://caltopo.com/m/${p.value}`} target="_blank">{p.value}</a>) },
  { field: 'title', headerName: 'Title', width: 300 },
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


const MapsPanel = ({ list, onRefresh }: { list: { title: string }[], onRefresh?: () => void }) => {
  const [syncing, setSyncing] = useState<boolean>(false);
  const [ adding, setAdding ] = useState<boolean>(false);
  const [addUrl, setAddUrl] = useState<string>('');
  const [addWorking, setAddWorking] = useState<boolean>(false);
  const [addError, setAddError] = useState<string>();

  async function startSync(mapId: string) {
    setSyncing(true);
    await fetch(`/api/v1/my/maps/${mapId}/sync`);
//    await loadTracks();
    setSyncing(false);
  }

  function startAddMap() {
    setAddError(undefined);
    setAddWorking(false);
    setAdding(true);
  }

  async function addMap() {
    setAddWorking(true);
    setAddError(undefined);
    try {
      const response = await fetch('/api/v1/my/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: addUrl }),
      })
      const result = await response.json();
      if (response.status !== 200) {
        setAddError(result.message);
        return;
      }
      onRefresh?.();
      setAdding(false);
    } finally {
      setAddWorking(false);
    }
  }

  const mapsColumns: GridColDef[] = [
    { field: 'mapId', headerName: 'ID', width: 90, renderCell: p => (<a href={`https://caltopo.com/m/${p.value}`} target="_blank">{p.value}</a>) },
    {
      field: 'title',
      headerName: 'Title',
      width: 300,
    },
    {
      field: 'actions',
      type: 'actions',
      align: 'right',
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem key="sync" icon={<SyncIcon />} onClick={() => startSync(params.row.mapId)} label="Sync" />,
      ]
    }
  ];

  return (
    <>
      <Box sx={{ width: '100%', bgcolor: 'background.paper', padding: 2, mb: 2 }}>
        <Typography variant="h5">My Maps</Typography>
        <DataGrid
          sx={{ height: 400 }}
          rows={list}
          columns={mapsColumns}
          getRowId={f => f.mapId}
          disableRowSelectionOnClick
        />
        <Button variant="contained" sx={{m:1}} onClick={startAddMap}>Add Map</Button>
      </Box>
      <Dialog open={syncing}>
        <DialogContent>Syncing map ...</DialogContent>
      </Dialog>
      <Dialog open={adding} onClose={() => setAdding(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Map</DialogTitle>
        <DialogContent>
          <CalTopoMapField value={addUrl} setValue={setAddUrl} fullWidth autoFocus />
          {addError && <Alert severity="error">{addError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdding(false)}>Cancel</Button>
          <Button variant="contained" onClick={addMap} disabled={addWorking}>Add Map</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function MyPage() {
  const user = useAppSelector(state => state.auth.userInfo);
  const [data, setData] = useState<{ list: { title: string }[] }>();
  const [tracks, setTracks] = useState<{ list: { title: string }[] }>();


  const [confirmingDisconnect, setConfirmingDisconnect] = useState<boolean>(false);
  const [disconnecting, setDisconnecting] = useState<boolean>(false);
  const [disconnectError, setDisconnectError] = useState<string>();

  function loadTracks() {
    return fetch('/api/v1/my/tracks').then(response => response.json()).then(setTracks);
  }

  function reload() {
    fetch('/api/v1/my/maps').then(response => response.json()).then(setData);
    loadTracks();
  }

  useEffect(reload, []);


  async function disconnectCalTopo() {
    setDisconnecting(true);
    setDisconnectError(undefined);
    try {
      const response = await fetch('/api/v1/my/caltopo-link', { method: 'DELETE' });
      const result = await response.json();

      if (response.status === 200) {
        document.location.reload();
      }
      setDisconnectError(result.data.message);
    } finally {
      setDisconnecting(false);
    }
  }



  return (
    <div>
      <Box sx={{ width: '100%', bgcolor: 'background.paper', padding: 2, mb: 2 }}>
        <Typography variant="h5">My Tracks</Typography>
        <DataGrid
          sx={{ height: 400 }}
          rows={tracks?.list ?? []}
          columns={tracksColumns}
          getRowId={f => f.mapId}
          disableRowSelectionOnClick
        />
      </Box>

      <MapsPanel list={data?.list ?? []} onRefresh={reload} />

      <Box sx={{ width: '100%', bgcolor: 'background.paper', padding: 2, mb: 2 }}>
        <Typography>If you want to connect your account to a different CalTopo User, you need to disconnect your existing account.</Typography>
        <Button variant="outlined" color="danger" sx={{ m: 1 }} onClick={() => setConfirmingDisconnect(true)}>Disconnect CalTopo User</Button>
      </Box>
      <Dialog open={confirmingDisconnect} onClose={() => setConfirmingDisconnect(false)}>
        <DialogContent>
          Disconnect from your CalTopo account? Your existing tracks will no longer be linked on this site.
          {disconnectError && <Alert severity="error">{disconnectError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmingDisconnect(false)}>Cancel</Button>
          <Button variant="contained" onClick={disconnectCalTopo} disabled={disconnecting}>Disconnect</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}