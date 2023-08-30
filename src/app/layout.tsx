import ClientOnly from '@challenge/components/ClientOnly';
import { getCookieAuth, userFromAuth } from '@challenge/lib/server/auth';
import { headers } from 'next/headers';
import ClientProviders, { SiteConfig } from './ClientProviders';
import "./globals.css"

export const metadata = {
  title: 'Tiger Challenge',
  description: 'Compare hiking times',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const hdrs = headers();

  const siteConfig: SiteConfig = {
    dev: {
      noExternalNetwork: !!process.env.DEV_NETWORK_DISABLED,
      buildId: process.env.CONFIG_BUILD_ID ?? 'unknown',
    },
    theme: {
      primary: 'rgb(200, 100, 100)',
    }
  };

  const user = userFromAuth(await getCookieAuth());

  return (
    <html lang="en">
      <head>
      </head>
      <body id="root">
        <ClientOnly>
          <ClientProviders googleClient={process.env.GOOGLE_ID ?? ''} config={siteConfig} user={user}>
            {children}
          </ClientProviders>
        </ClientOnly>
      </body>
    </html>
  )
}