import { ironSessionWrapperParams, RouteHandlerWithSessionParams } from '@challenge/lib/session';
import { NextResponse } from 'next/server';
import { getServices } from '@challenge/lib/server/services';

interface GetParams { id: string };

export const GET: RouteHandlerWithSessionParams<GetParams> = ironSessionWrapperParams<GetParams>(async (request, { params }) => {
  const auth = request.session.auth;
  if (!auth) {
    return new Response(JSON.stringify({ status: 'denied' }), { status: 401 });
  }

  const list = await (await getServices()).routes.listRoutes();

  return NextResponse.json({
    status: 'ok',
    list,
  });
})