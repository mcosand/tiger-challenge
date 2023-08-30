export interface TrackSegmentStats {
  title: string,
  start: number,
  length: number,
  time: number,
  speed: number,
};

export interface UserTrackDoc {
  email: string;
  userName: string;
  mapId: string;
  caltopoId: string;
  updated: number;
  routeId: string;

  started: number;
  up?: TrackSegmentStats,
  down?: TrackSegmentStats,
  total?: TrackSegmentStats,
  splits: TrackSegmentStats[],
}
