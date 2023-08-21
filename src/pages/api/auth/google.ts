import { sessionOptions } from '@respond/lib/session';
import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServices } from '@respond/lib/server/services';
import * as Auth from '@respond/lib/server/auth';
import { MemberProvider } from '@respond/lib/server/memberProviders/memberProvider';
import { TokenPayload } from 'google-auth-library';
import { AuthResponse } from '@respond/types/authResponse'
import { AuthError } from '@respond/lib/apiErrors'
import D4HMembersProvider from '@respond/lib/server/memberProviders/d4hMembersProvider';
import { MemberProviderType } from '@respond/types/data/MemberProviderType';

async function apiLogin(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({message: 'Login requires POST'});
    return;
  }

  let memberProvider: MemberProvider|undefined = undefined;
  //try {
    let payload: TokenPayload|undefined;
    if (process.env.DEV_NETWORK_DISABLED) {
      const data = process.env.DEV_AUTH_USER ?? '{}';
      console.log('login data', data);
      payload = JSON.parse(data);
    } else {
      const { token } = req.body;
      const authClient = (await getServices()).authClient;

      const ticket = await authClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_ID,
      });

      payload = ticket.getPayload();
    }

    if (!payload) {
      const error: AuthResponse = {
        error: AuthError.NO_TICKET,
      }

      res.status(500).json(error);
      return;
    }

    if (!payload.email) {
      const error: AuthResponse = {
        error: AuthError.NO_EMAIL,
      }

      res.status(500).json(error);
      return;
    }

    const domain = req.headers.host?.split(':')[0] ?? '';


    memberProvider = (await getServices()).memberProviders.get(MemberProviderType.D4H);

    const authInfo = {
      provider: 'google',
      email: payload.email,
    };

    const memberInfo = await memberProvider.getMemberInfo(authInfo);
    if (!memberInfo) {
      const error: AuthResponse = {
        error: AuthError.USER_NOT_KNOWN,
      }

      res.status(403).json(error);
      return;
    }

    req.session.auth = {
      email: payload.email,
      userId: memberInfo.id,
      groups: memberInfo.groups,
      isSiteAdmin: false,
      ...payload,
    };

    console.log(`Logging in user ${payload.email}`);
    await req.session.save();

    const userInfo = Auth.userFromAuth(req.session.auth)
    const responseBody: AuthResponse = {
      userInfo,
    }

    res.json(responseBody);
  // } catch (error) {
  //   res.status(500).json({error: (error as Error).message });
  // }

  res.end();
  memberProvider?.refresh();
}

export default withIronSessionApiRoute(apiLogin, sessionOptions);