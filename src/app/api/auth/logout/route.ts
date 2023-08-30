import { ironSessionWrapper, RouteHandlerWithSession } from '@challenge/lib/session';
import { NextResponse } from 'next/server';

export const GET: RouteHandlerWithSession = ironSessionWrapper(async (request) => {
  const auth = request.session.auth;
  if (!auth) {
    return new Response(JSON.stringify({ status: 'denied' }), { status: 401 });
  }

  request.session.destroy();

  return NextResponse.json({
    status: 'ok',
  })
})