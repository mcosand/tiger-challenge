import { ironSessionWrapper, RouteHandlerWithSession } from '@challenge/lib/session';
import { NextResponse } from 'next/server';
import mongoPromise from '@challenge/lib/server/mongodb';
import { UserDoc } from '@challenge/types/data/userDoc';
import { generateCalTopoVerificationToken } from '@challenge/lib/server/caltopoClient';
import { getServices } from '@challenge/lib/server/services';
import { isCalTopoError, MAP_URL_CODE_GROUP, MAP_URL_ID_GROUP, MAP_URL_REGEX } from '@challenge/types/caltopo';

function e(status: number, msg: string) {
  return NextResponse.json({
    status: 'error',
    message: msg
  }, { status });
}

export const POST: RouteHandlerWithSession = ironSessionWrapper(async (request) => {
  const auth = request.session.auth;
  if (!auth) {
    return new Response(JSON.stringify({ status: 'denied' }), { status: 401 });
  }

  const mapUrl: string = (await request.json()).url;

  const caltopo = (await getServices()).caltopo;

  const match = MAP_URL_REGEX.exec(mapUrl) ?? [];
  const mapId = match[MAP_URL_ID_GROUP];
  if (!mapId) {
    return e(400, `Don't understand url`);
  }

  try {
    const bookmarkResult = await caltopo.createBookmark(mapId, match[MAP_URL_CODE_GROUP]);

    const map = await caltopo.getMap(bookmarkResult.properties.mapId);

    const validatingFeature = map.state.features.find(f => f.properties?.title === request.session.verificationToken);
    if (!validatingFeature) return e(404, `Can't find an object with title "${request.session.verificationToken}"`);

    const creator = validatingFeature.properties?.creator;
    if (!creator) return e(404, `Can't figure out who created the test object`);

    const mongo = await mongoPromise;
    const mongoresult = await mongo.db().collection<UserDoc>('users').updateOne({ email: auth.email }, { $set: { caltopoApiKey: creator }});
    if (mongoresult.matchedCount === 0) return e(500, `Couldn't update your database record`);

    request.session.caltopoApiKey = creator;
    delete request.session.verificationToken;
    await request.session.save();

    return NextResponse.json({
      status: 'ok',
      data: { creator }
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

export const DELETE: RouteHandlerWithSession = ironSessionWrapper(async (request) => {
  const auth = request.session.auth;
  if (!auth) {
    return new Response(JSON.stringify({ status: 'denied' }), { status: 401 });
  }

  const mongo = await mongoPromise;
  const mongoresult = await mongo.db().collection<UserDoc>('users').updateOne({ email: auth.email }, { $unset: { caltopoApiKey: true }});
  if (mongoresult.matchedCount === 0) return e(500, `Couldn't update your database record`);

  delete request.session.caltopoApiKey;
  request.session.verificationToken = generateCalTopoVerificationToken();
  await request.session.save();

  return NextResponse.json({
    status: 'ok'
  });
});