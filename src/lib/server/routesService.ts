import { buffer, Feature, LineString, Point, Polygon, Position } from '@turf/turf';
import mongoPromise from '@challenge/lib/server/mongodb';
import { RouteMapDoc } from '@challenge/types/data/routeMapDoc';
import { apiFetch } from '../api';
import { CalTopoMapSince } from '@challenge/types/caltopo';
import { ListRoutesItem } from '@challenge/types/api/listRoutesApi';

export class RoutesService {
  private routes: Record<string, { route: Feature<LineString>, buffered: Feature<Polygon>, splits: { title: string, point: Position }[]}> = {};

  private async init() {
    if (Object.keys(this.routes).length == 0) {
      await this.loadRoutes();
    }
  }

  private async loadRoutes() {
    const mongo = await mongoPromise;
    const routeMapDocs = await (await mongo.db().collection<RouteMapDoc>('routeMaps').find().toArray())
                          .filter(d => d.isPublished ?? true);
    for (const doc of routeMapDocs) {
      const routeMap = await (await apiFetch<CalTopoMapSince>(`https://caltopo.com/api/v1/map/${doc.mapId}/since/0`)).result.state;
      for (const r of routeMap.features.filter(f => f.properties?.class === 'Shape')) {
        const route = r as Feature<LineString>;
        const buffered = buffer(r, 100, { units: 'feet' }) as Feature<Polygon>;

        console.log('looking for split points ' + `${r.properties?.title}-split`);
        const splitPoints = routeMap.features.filter(f => f.properties?.class === 'Marker' && f.properties?.title?.startsWith(`${r.properties?.title}-split`));
        splitPoints.sort((a,b) => (a.properties?.title ?? '') - (b.properties?.title ?? ''));

        const splits = [
          { title: 'Start', point: route.geometry.coordinates[0] },
          ...splitPoints.map(f => ({ title: (f.properties?.description ?? 'N/A').split('\n')[0], point: (f.geometry as Point).coordinates })),
          { title: 'Top', point: route.geometry.coordinates[route.geometry.coordinates.length - 1] },
          { title: 'Return', point: route.geometry.coordinates[0] },
        ];
        console.log('found split points ', splits);
        this.routes[route.id!] = {
            route,
            buffered,
            splits,
          };
      }
    }
  }

  async listRoutes(): Promise<ListRoutesItem[]> {
    await this.init();
    return Object.values(this.routes).map(r => ({
      id: r.route.id as string,
      title: r.route.properties?.title ?? 'Unnamed',
      description: r.route.properties?.description?.split('\n')?.[0],
    }));
  }
}