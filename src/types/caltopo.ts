import { FeatureCollection } from '@turf/turf'

export const MAP_URL_REGEX = /^(((https:\/\/)?(cal|sar)topo\.com)?\/m\/)?([a-z0-9]{5})(\/([a-z0-9]+))?$/i;
export const MAP_URL_MODE_GROUP = 4;
export const MAP_URL_ID_GROUP = 5;
export const MAP_URL_CODE_GROUP = 7;

export interface CalTopoApiResponse<T> {
  status: 'ok',
  result: T,
}

export interface CalTopoApiError {
  status: 'error',
  message: string,
  code: number,
}

export function isCalTopoError(result: unknown): result is CalTopoApiError {
  return (typeof result === 'object' && !!result && 'status' in (result as any) && (result as any).status === 'error');
}


export interface CalTopoBookmark {
  id: string,
  properties: {
    accountId: string,
    created: number,
    mapUpdated: number,
    description?: string,
    mapId: string,
    type: number,
    title: string,
    class: 'UserAccountMapRel',
  },
}

export type CalTopoMap = {
  state: FeatureCollection
};