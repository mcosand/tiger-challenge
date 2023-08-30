import { TrackSegmentStats } from '../data/UserTrackDoc';

export interface RouteUserTrackStats {
  id: string,
  userName: string,
  started: number,
  updated: number,
  total?: TrackSegmentStats,
  up?: TrackSegmentStats,
  down?: TrackSegmentStats,
  splits: TrackSegmentStats[],
}