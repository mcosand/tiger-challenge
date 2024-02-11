import { ironSessionWrapperParams, RouteHandlerWithSessionParams } from '@challenge/lib/session';
import { NextResponse } from 'next/server';
import { TracksService } from '@challenge/lib/server/tracksService';

interface GetParams { id: string };


export const GET: RouteHandlerWithSessionParams<GetParams> = ironSessionWrapperParams<GetParams>(async (request, { params }) => {
  const auth = request.session.auth;
  if (!auth) {
    return new Response(JSON.stringify({ status: 'denied' }), { status: 401 });
  }

  const result = await new TracksService().syncMap(params.id, auth);

  return NextResponse.json({
    status: 'ok',
    ...result,
  });
})