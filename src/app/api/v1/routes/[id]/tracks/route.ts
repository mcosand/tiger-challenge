import { ironSessionWrapperParams, RouteHandlerWithSessionParams } from '@challenge/lib/session';
import { NextResponse } from 'next/server';
import mongoPromise from '@challenge/lib/server/mongodb';
import { UserTrackDoc } from '@challenge/types/data/UserTrackDoc';
import { RouteUserTrackStats } from '@challenge/types/api/routeUserTrackStats';

interface GetParams { id: string };

export const GET: RouteHandlerWithSessionParams<GetParams> = ironSessionWrapperParams<GetParams>(async (request, { params }) => {
  const auth = request.session.auth;
  if (!auth) {
    return new Response(JSON.stringify({ status: 'denied' }), { status: 401 });
  }

  const mongo = await mongoPromise;
  const trackDocs = await mongo.db().collection<UserTrackDoc>('userTracks').find({ routeId: params.id }).toArray();
  const tracks: RouteUserTrackStats[] = trackDocs.map(t => {
    const { _id, email, mapId, caltopoId, routeId, ...apiTrack } = t;
    return { id: caltopoId, ...apiTrack };
  });

  return NextResponse.json({
    status: 'ok',
    list: tracks,
  });
})