import { MAP_URL_ID_GROUP, MAP_URL_REGEX } from '@challenge/types/caltopo';
import { Alert, Button, CircularProgress, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { CalTopoMapField } from './CalTopoMapField';
import { Typography } from './Material';



export default function CalTopoValidationPanel({ token }: { token: string }) {
  const [ mapUrl, setMapUrl ] = useState<string>('');
  const [ isWorking, setIsWorking ] = useState<boolean>(false);
  const [ error, setError ] = useState<string>();

  const mapId = MAP_URL_REGEX.exec(mapUrl ?? '')?.[MAP_URL_ID_GROUP];

  async function linkToCalTopo() {
    setIsWorking(true);
    setError(undefined);
    try {
      const response = await fetch('/api/v1/my/caltopo-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: mapUrl }),
      })
      const result = await response.json();
      if (response.status !== 200) {
        setError(result.message);
        return;
      }

      document.location.reload();

    } finally {
      setIsWorking(false);
    }
  }

  return (<Stack direction="column" spacing={2}>
    <Typography variant="h6">Connect your CalTopo Account</Typography>
    <Typography>To log your tracks, you need to link this account to your CalTopo account.</Typography>
    <ol>
      <li>Proceed to <a href="https://caltopo.com/map.html" target="_blank">CalTopo</a> in your browser or the CalTopo app and make sure you&apos;re logged in.</li>
      <li>On a map, create a marker anywhere. Assign it the title <code style={{border: 'solid 1px #444', borderRadius: 3, padding: '1px 5px'}}>{token}</code>. (You can delete this marker later.)</li>
      <li>Save the map to your account.</li>
      <li>Return to this page, let us know where the map is, and press the button.</li>
    </ol>
    <Typography>If you create your map with sharing set to Public or URL, you only need to provide the 5-digit map id. If
      you set sharing to Secret, you&apos;ll need to enter a sharing code URL
    </Typography>
    <CalTopoMapField value={mapUrl} setValue={setMapUrl} />
    {error && <Alert severity="error">{error}</Alert>}
    <Button variant="contained" disabled={!mapId || isWorking} onClick={() => linkToCalTopo()}>
      {isWorking && <CircularProgress size={18} sx={{mr:1}} />}
      Link CalTopo Account
    </Button>
  </Stack>);
}