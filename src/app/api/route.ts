import { ironSessionWrapper, RouteHandlerWithSession } from '@challenge/lib/session';
import { NextResponse } from 'next/server';

export const GET: RouteHandlerWithSession = ironSessionWrapper(async (request) => {
  return NextResponse.json({
    session: request.session
  })
})