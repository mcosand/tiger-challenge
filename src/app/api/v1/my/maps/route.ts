import { ironSessionWrapper, RouteHandlerWithSession } from '@challenge/lib/session';
import { NextResponse } from 'next/server';
import mongoPromise from '@challenge/lib/server/mongodb';
import { UserDoc } from '@challenge/types/data/userDoc';
import { getServices } from '@challenge/lib/server/services';
import { isCalTopoError, MAP_URL_CODE_GROUP, MAP_URL_ID_GROUP, MAP_URL_REGEX } from '@challenge/types/caltopo';
import { TracksService } from '@challenge/lib/server/tracksService';

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
  });
});

export const POST: RouteHandlerWithSession = ironSessionWrapper(async (request) => {
  const auth = request.session.auth;
  if (!auth || !request.session.caltopoApiKey) {
    return new Response(JSON.stringify({ status: 'denied' }), { status: 401 });
  }

  const mapUrl: string = (await request.json()).url;
  console.log('Try to add map ' + mapUrl);

  const caltopo = (await getServices()).caltopo;

  const match = MAP_URL_REGEX.exec(mapUrl) ?? [];
  let mapId = match[MAP_URL_ID_GROUP];
  if (!mapId) {
    return NextResponse.json({
      status: 'error',
      message: `Don't understand url`
    }, { status: 400 });
  }

  try {
    const bookmarkResult = await caltopo.createBookmark(mapId, match[MAP_URL_CODE_GROUP]);
    mapId = bookmarkResult.properties.mapId;

    const map = await caltopo.getMap(mapId);

    const userHasFeature = map.state.features.some(f => f.properties?.creator === request.session.caltopoApiKey);

    if (!userHasFeature) {
      return NextResponse.json({
        status: 'error',
        message: `Map found, but your account hasn't created any objects on it`,
      });
    }

    const mongo = await mongoPromise;
    const existing = await mongo.db().collection<UserDoc>('users').findOne({ 'maps.mapId': mapId });
    if (existing) {
      return NextResponse.json({
        status: 'error',
        message: 'This map is already being managed by someone else.',
      }, { status: 400 });
    }

    await mongo.db().collection('users').updateOne({ email: auth.email }, { '$push': {
      maps: {
        mapId,
        title: bookmarkResult.properties.title
      }
    }});

    await new TracksService().syncMap(mapId, auth);

    return NextResponse.json({
      status: 'ok',
    });
  } catch (err) {
    if (isCalTopoError(err)) {
      if (err.code === 401) {
        return NextResponse.json({
          message: 'Could not access the map. Is it set to sharing=Private?'
        }, { status: 404 });
      }
      return NextResponse.json({
        message: err.message
      }, { status: 500 });
    }
    throw err;
  }
});
