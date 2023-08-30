'use client';

import { createTheme, ThemeOptions, ThemeProvider, useMediaQuery } from '@challenge/components/Material';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ReactNode, useMemo, useState } from 'react';

import { Provider } from 'react-redux';
import { ConfigActions } from '@challenge/lib/client/store/config';
import { UserInfo } from '@challenge/types/userInfo';
import { AuthActions } from '@challenge/lib/client/store/auth';
import { AppStore, buildClientStore } from '@challenge/lib/client/store';

export interface SiteConfig {
  theme: { primary: string; primaryDark?: string };
  dev: { noExternalNetwork: boolean, buildId: string };
}

export default function ClientProviders(
  { googleClient, config, user, children }:
  { googleClient: string, config: SiteConfig, user?: UserInfo, children: ReactNode}
) {
  const [ store ] = useState<AppStore>(buildClientStore([]));

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const hydratedTheme = useMemo(() => {
    console.log('rendering theme');
    const theme: ThemeOptions = {
      palette: {
        mode: prefersDarkMode ? 'dark' : 'light',
        background: {
          default: '#f00',
        },
        primary: { main: (prefersDarkMode ? config.theme.primaryDark : config.theme.primary) ?? config.theme.primary },
        danger: { main: 'rgb(192,0,0)', contrastText: 'white' },
      },
    }
    return createTheme(theme);
  }, [ prefersDarkMode, config.theme ]);


  if (!store) {
    return (<>Loading ...</>)
  }

  store.dispatch(ConfigActions.set({ dev: config.dev }));
  store.dispatch(AuthActions.set({ userInfo: user }));

  let inner = children;
  if (!config.dev.noExternalNetwork) {
    inner = (<GoogleOAuthProvider clientId={googleClient}>{inner}</GoogleOAuthProvider>);
  }

  return (
    <Provider store={store}>
      <ThemeProvider theme={hydratedTheme}>
        {inner}
      </ThemeProvider>
    </Provider>
  )
}