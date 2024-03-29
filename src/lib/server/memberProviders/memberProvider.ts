import { MemberProviderType } from '@challenge/types/data/MemberProviderType'

export interface MemberInfo {
  id: string;
  groups: string[];
}

export interface MemberAuthInfo {
  provider: string;
  email: string;
  [key: string]: any;
}

export interface MemberProvider {
  getMemberInfo(authPayload: MemberAuthInfo): Promise<MemberInfo|undefined>;
  getMemberInfoById(memberId: string): Promise<MemberInfo|undefined>;
  refresh(force?: boolean): Promise<{ ok: boolean, runtime: number, cached?: boolean }>;
}

export class MemberProviderRegistry {
  private lookup: {[key:string]: MemberProvider} = {};

  register(key: MemberProviderType, provider: MemberProvider) {
    this.lookup[key] = provider;
  }

  get(key: string) {
    return this.lookup[key];
  }
}

export const defaultMembersRepositoryRegistry = new MemberProviderRegistry();
