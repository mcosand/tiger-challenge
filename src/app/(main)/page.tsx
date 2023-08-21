'use client';
import { Box } from "@mui/material";
import { useEffect } from 'react';
import addDays from 'date-fns/addDays'


export default function Home() {

  const maxCompletedActivitiesVisible = 3;
  const oldestCompletedActivityVisible = addDays(new Date(), -3).getTime();

  useEffect(() => {
    document.title = "Home";
  }, []);

  return (
    <main>
      <Box>Main Content</Box>
    </main>
  );
}