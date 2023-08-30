import { ironSessionWrapper, RouteHandlerWithSession } from '@challenge/lib/session';
import { NextResponse } from 'next/server';
import mongoPromise from '@challenge/lib/server/mongodb';
import { UserDoc } from '@challenge/types/data/userDoc';

export const GET: RouteHandlerWithSession = ironSessionWrapper(async (request) => {
  const auth = request.session.auth;
  if (!auth) {
    return new Response(JSON.stringify({ status: 'denied' }), { status: 401 });
  }

  const email = auth.email;

  const mongo = await mongoPromise;
  const rows = await mongo.db().collection<UserDoc>('users').find({ email }).toArray();
  console.log(rows[0]);

  return NextResponse.json({
    status: 'ok',
    list: rows[0].maps,
  })
})