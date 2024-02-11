import mongoPromise from '@challenge/lib/server/mongodb';
import { UserDoc } from '@challenge/types/data/userDoc';
import { apiFetch } from '@challenge/lib/api';
import { booleanContains, booleanPointInPolygon, buffer, Feature, length, LineString, lineString, Point, point, Polygon, Position } from '@turf/turf';
import { CalTopoApiResponse, CalTopoMap } from '@challenge/types/caltopo';
import { TrackSegmentStats, UserTrackDoc } from '@challenge/types/data/UserTrackDoc';
import { getServices } from '@challenge/lib/server/services';

function statsForLine(title: string, line: Position[]): TrackSegmentStats {
  const feature = lineString(line);
  const len = length(feature, { units: 'miles' });
  const time = line[line.length - 1][3] - line[0][3];
  return ({
    title,
    start: line[0][3],
    length: len,
    time,
    speed: len / (time / 3600 / 1000),
  });
}

export class TracksService {
  async syncMap(mapId: string, user: { email: string, name?: string }) {

    const mongo = await mongoPromise;


    const routes = await (await getServices()).routes.getAllRoutes();

    const caltopoSince = await (await getServices()).caltopo.getMap(mapId, 0);

    const parsedTracks: UserTrackDoc[] = [];

    const route = routes[0];
    const lines: Feature<LineString>[] = caltopoSince.state.features.filter(f => (
      f.properties?.class === 'Shape' &&
      f.geometry.type === 'LineString' &&
      booleanContains(route.buffered, f) &&
      (f.geometry.coordinates[0] as Position[]).length > 3
    ))
      .map(f => f as Feature<LineString>);

    for (const track of lines) {
      const coords = track.geometry.coordinates;

      const userTrack: UserTrackDoc = {
        email: user.email,
        userName: user?.name ?? '',
        mapId,
        caltopoId: track.id as string,
        title: track.properties?.title ?? 'Unnamed',
        updated: track.properties?.updated,
        routeId: route.route.id as string,
        started: coords[0][3],
        splits: [],
      }

      let splitIndex = 0;
      let splitPointBuffer = buffer(point(route.splits[splitIndex].point), 50, { units: 'feet' });
      let enterSplitIndex: number | undefined = undefined;
      let courseStartIndex: number | undefined = undefined;

      console.log(track.properties?.title);
      for (let i = 0; i < coords.length - 1; i++) {
        if (enterSplitIndex === undefined && booleanPointInPolygon(coords[i], splitPointBuffer) && !booleanPointInPolygon(coords[i + 1], splitPointBuffer)) {
          enterSplitIndex = i;
          splitIndex++;
          if (splitIndex === 1) {
            courseStartIndex = i;
          } else if (splitIndex >= route.splits.length) {
            break;
          }
          splitPointBuffer = buffer(point(route.splits[splitIndex].point), 50, { units: 'feet' });
        } else if (enterSplitIndex !== undefined && !booleanPointInPolygon(coords[i], splitPointBuffer) && booleanPointInPolygon(coords[i + 1], splitPointBuffer)) {
          userTrack.splits.push(statsForLine(route.splits[splitIndex].title, coords.slice(enterSplitIndex, i)))

          if (splitIndex === route.splits.length - 2) {
            console.log('found up total');
            userTrack.up = statsForLine('Up', coords.slice(courseStartIndex, i));
          } else if (splitIndex === route.splits.length - 1) {
            console.log('found down segment');
            userTrack.down = userTrack.splits.pop();
            userTrack.total = statsForLine('Total', coords.slice(courseStartIndex, i));
          }
          // splitIndicies.push([enterSplitIndex, i]);
          enterSplitIndex = undefined;
        }
      }

      if (userTrack.splits.length === route.splits.length - 2) {
        await mongo.db().collection<UserTrackDoc>('userTracks').replaceOne({ caltopoId: userTrack.caltopoId }, userTrack, { upsert: true });
        parsedTracks.push(userTrack);
      }
    }

    return {
      data: caltopoSince.state,
      route: routes[0],
      titles: caltopoSince.state.features.map(f => f.properties?.title),
      //c: lines.map(l => ({ t: l.properties?.title, c: booleanContains(routes[0].buffered, l) })),
      tracks: parsedTracks,

      //o: lines.map(l => ({ t: l.properties?.title, o: booleanOverlap(routes[0].buffered, l)})),
    }
  }
}