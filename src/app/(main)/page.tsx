'use client';
import Link from 'next/link';
import { Box, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { useEffect, useState } from 'react';
import { apiFetch } from '@challenge/lib/api';
import { ListRoutesApiResult, ListRoutesItem } from '@challenge/types/api/listRoutesApi';
import { Typography } from '@challenge/components/Material';


export default function Home() {

  const [ list, setList ] = useState<ListRoutesItem[]>([]);

  useEffect(() => {
    document.title = "Home";
    apiFetch<ListRoutesApiResult>('/api/v1/routes').then(r => r.list).then(setList);
  }, []);

  return (
    <main>
    <Box sx={{ width: '100%', bgcolor: 'background.paper', padding: 2 }}>
      <Typography variant="h5">Published Routes</Typography>
      <nav aria-label="list of routes">
        <List disablePadding>
          {list.length === 0
            ? (<ListItem><ListItemText primary="Loading ..."></ListItemText></ListItem>)
            : list.map(r => (
                <ListItem key={r.id}>
                  <ListItemButton LinkComponent={Link} href={`/route/${r.id}`}>
                    <ListItemText primary={r.title} secondary={r.description} />
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
        </nav>
      </Box>
    </main>
  );
}