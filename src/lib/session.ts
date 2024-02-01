import { getIronSession, IronSession } from 'iron-session'
import UserAuth from '@challenge/types/userAuth';

export const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: process.env.SESSION_COOKIE_NAME as string,
  // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}

// This is where we specify the typings of req.session.*
  interface IronSessionData {
    auth?: UserAuth;
  }

type DynamicSegments<T> = {
  params: T;
};

type RouteHandler<T> = (
  request: Request,
  routeSegment: DynamicSegments<T>
) => Promise<Response>;

export type RouteHandlerWithSession = RouteHandlerWithSessionParams<never>;

export type RouteHandlerWithSessionParams<T> = (
  request: Request & { session: IronSession<IronSessionData> },
  routeSegment: DynamicSegments<T>
) => Promise<Response>;

export function ironSessionWrapper(handler: RouteHandlerWithSession): RouteHandler<never> {
  return ironSessionWrapperParams<never>(handler);
}

export function ironSessionWrapperParams<T>(handler: RouteHandlerWithSessionParams<T>): RouteHandler<T> {
  return async (request, routeSegment) => {
    const cookieResponse = new Response();
    const session = await getIronSession(
      request,
      cookieResponse,
      sessionOptions
    );

    const sessionRequest = Object.assign(request, { session });
    const response = await handler(sessionRequest, routeSegment);

    const setCookie = cookieResponse.headers.get("set-cookie");
    if (setCookie) {
      response.headers.set("set-cookie", setCookie);
    }

    return response;
  };
};