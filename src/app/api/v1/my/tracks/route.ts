import { ironSessionWrapper, RouteHandlerWithSession } from '@challenge/lib/session';
import { NextResponse } from 'next/server';
import mongoPromise from '@challenge/lib/server/mongodb';
import { UserTrackDoc } from '@challenge/types/data/UserTrackDoc';

export const GET: RouteHandlerWithSession = ironSessionWrapper(async (request) => {
  const auth = request.session.auth;
  if (!auth) {
    return new Response(JSON.stringify({ status: 'denied' }), { status: 401 });
  }

  const email = auth.email;

  const mongo = await mongoPromise;
  const list = await mongo.db().collection<UserTrackDoc>('userTracks').find({ email }).toArray();

  return NextResponse.json({
    status: 'ok',
    list,
  })
})