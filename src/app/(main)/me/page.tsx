'use client';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import SyncIcon from '@mui/icons-material/Sync';
import { DataGrid, GridActionsCellItem, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { useAppSelector } from '@challenge/lib/client/store';
import { Dialog, DialogContent, Skeleton, Typography } from '@mui/material';
import { format } from 'date-fns';
import { formatDuration } from '@challenge/lib/formatting';
import { ProfileApiResult } from '@challenge/types/api/profileApi';
import MyPage from '@challenge/components/MyPage';
import CalTopoValidationPanel from '@challenge/components/CalTopoValidationPanel';

export default function UserPage() {
  const user = useAppSelector(state => state.auth.userInfo);
  const [ data, setData ] = useState<ProfileApiResult>()

  useEffect(() => {
    fetch('/api/v1/my/profile').then(response => response.json()).then(setData);
  }, []);

  return (
    <div>
      {!data && <Skeleton variant="rounded" width="100%" height={60} />}
      {data?.caltopoValidation && !data?.caltopoApiKey && <CalTopoValidationPanel token={data.caltopoValidation} />}
      {data?.caltopoApiKey && <MyPage />}
    </div>
  )
}