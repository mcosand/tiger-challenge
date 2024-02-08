import { ironSessionWrapper, RouteHandlerWithSession } from '@challenge/lib/session';
import { NextResponse } from 'next/server';
import mongoPromise from '@challenge/lib/server/mongodb';
import { UserDoc } from '@challenge/types/data/userDoc';
import { ProfileApiResult } from '@challenge/types/api/profileApi';
import { generateCalTopoVerificationToken } from '@challenge/lib/server/caltopoClient';

export const GET: RouteHandlerWithSession = ironSessionWrapper(async (request) => {
  const auth = request.session.auth;
  if (!auth) {
    return new Response(JSON.stringify({ status: 'denied' }), { status: 401 });
  }

  const mongo = await mongoPromise;
  const user = await mongo.db().collection<UserDoc>('users').findOne({ email: auth.email });
  console.log('didnt find user ' + auth.email);
  if (!user) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  if (!user.caltopoApiKey && !request.session.verificationToken) {
    request.session.verificationToken = generateCalTopoVerificationToken();
    await request.session.save();
  }

  return NextResponse.json({
    status: 'ok',
    caltopoValidation: request.session.verificationToken,
    caltopoApiKey: user.caltopoApiKey,
    anonymous: user.anonymous,
  } as ProfileApiResult);
})