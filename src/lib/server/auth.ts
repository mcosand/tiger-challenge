import UserAuth from '@challenge/types/userAuth';
import { UserInfo } from '@challenge/types/userInfo';
import { unsealData } from "iron-session";
import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { cookies } from 'next/headers';
import { IronSessionData } from '../session';

export async function getCookieAuth() {
  return getAuthFromCookies(cookies());
}

export async function getAuthFromApiCookies(
  cookies: Partial<{[key: string]: string}>
): Promise<UserAuth|undefined> {
  const cookieName = process.env.SESSION_COOKIE_NAME as string;
  return getAuthFromCookie(cookies[cookieName]);
}


/**
 * Can be called in page/layout server component.
 * @param cookies ReadonlyRequestCookies
 * @returns UserAuth or undefined
 */
export async function getAuthFromCookies(
  cookies: RequestCookies | ReadonlyRequestCookies
): Promise<UserAuth | undefined> {
  const cookieName = process.env.SESSION_COOKIE_NAME as string;
  return getAuthFromCookie(cookies.get(cookieName)?.value);
}

async function getAuthFromCookie(
  sessionCookie?: string
) {
  if (!sessionCookie) return undefined;

  const { auth } = await unsealData<IronSessionData>(sessionCookie, {
    password: process.env.SECRET_COOKIE_PASSWORD as string,
  });
  return auth;
}


export function userFromAuth(ticket?: UserAuth): UserInfo|undefined {
  if (!ticket) return undefined;
  return {
    userId: ticket.userId,
    participantId: ticket.userId.split(':')[1],
    name: ticket.name ?? '',
    email: ticket.email,
    domain: ticket.hd ?? '',
    picture: ticket.picture,
    given_name: ticket.given_name,
    family_name: ticket.family_name,
  }
}