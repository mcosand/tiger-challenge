'use client';
import Link from 'next/link';
import { Box, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { useEffect, useState } from 'react';
import { apiFetch } from '@challenge/lib/api';
import { ListRoutesApiResult, ListRoutesItem } from '@challenge/types/api/listRoutesApi';


export default function Home() {

  const [ list, setList ] = useState<ListRoutesItem[]>([]);

  useEffect(() => {
    document.title = "Home";
    apiFetch<ListRoutesApiResult>('/api/v1/routes').then(r => r.list).then(setList);
  }, []);

  return (
    <main>
    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
      <nav aria-label="list of routes">
        <List disablePadding>
          {list.map(r => (
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