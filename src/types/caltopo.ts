import { FeatureCollection } from '@turf/turf'

interface CalTopoApiResponse<T> {
  status: 'ok',
  result: T,
}

export type CalTopoMapSince = CalTopoApiResponse<{
  state: FeatureCollection
}>;
