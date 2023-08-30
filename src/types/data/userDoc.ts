export interface UserMapDoc {
  mapId: string;
  title: string;
  updated: number;
}

export interface UserDoc {
  email: string;
  name: string;
  anonymous: boolean;
  lastLogin: number;
  maps: UserMapDoc[];
}