'use client';

import { Box, Button, Stack } from '@respond/components/Material';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import Api from '@respond/lib/api';
import { useAppDispatch, useAppSelector } from '@respond/lib/client/store';
import { AuthActions } from '@respond/lib/client/store/auth';
import { AuthResponse } from '@respond/types/authResponse'
import { useState } from 'react'
import { AuthError } from '@respond/lib/apiErrors'
import { Alert, AlertTitle } from '@mui/material'
import { MemberProviderName } from '@respond/types/data/MemberProviderType'

export default function LoginPanel() {
  const { noExternalNetwork } = useAppSelector(state => state.config.dev );
  const dispatch = useAppDispatch();
  let [error, setError] = useState("");
  let [errorDetails, setErrorDetails] = useState("");

  async function doLogin(data: CredentialResponse) {
    if (!data || !data.credential) {
      throw new Error('login error');
    }
    return await finishLogin(data.credential);
  }

  async function doOfflineLogin() {
    return await finishLogin('');
  }

  async function finishLogin(token: string) {
    const res = await Api.post<any>('/api/auth/google', { token }) as AuthResponse;
    console.log('login response', res);

    if (res.userInfo) {
      localStorage.userAuth = JSON.stringify(res.userInfo);
      dispatch(AuthActions.set({ userInfo: res.userInfo }));
    } else {
      switch (res.error) {
        case AuthError.USER_NOT_KNOWN:
            setError("Could not find your email address");
            setErrorDetails(`Please log in with an authorized email address.`);
          break;

        default:
          setError("Error logging in" + (res.error ? ` - ${res.error}` : ""));
          setErrorDetails(`Please try again.`);
          break;
      }

    }

    return res;
  }

  return (
    <Box sx={{flexGrow: 1, display: 'flex', justifyContent:'center'}}>
      {noExternalNetwork
      ? <Button onClick={doOfflineLogin}>offline login</Button>
      : <Stack spacing={2}>
          { error && <Alert severity="error">
            <AlertTitle>{error}</AlertTitle>
            {errorDetails}
          </Alert> }

          <GoogleLogin
            onSuccess={doLogin}
            onError={() => console.log('Google error')}
          />
        </Stack>
      }
    </Box>
  )
}