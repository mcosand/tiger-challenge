import { OAuth2Client } from 'google-auth-library';
import { MemberProviderRegistry } from './memberProviders/memberProvider';
import D4HMembersProvider from './memberProviders/d4hMembersProvider';
import { MemberProviderType } from '@challenge/types/data/MemberProviderType';
import { RoutesService } from './routesService';
import { CalTopoClient } from './caltopoClient';

export interface Services {
  authClient: OAuth2Client;
  routes: RoutesService;
  caltopo: CalTopoClient;
  memberProviders: MemberProviderRegistry;
}

let instance: Services;

export async function getServices(): Promise<Services> {
  if (!instance) {

    instance = {
      authClient: new OAuth2Client(process.env.GOOGLE_ID),
      caltopo: new CalTopoClient(process.env.CALTOPO_APIKEY ?? '', process.env.CALTOPO_AUTHID ?? '', process.env.CALTOPO_AUTHKEY ?? ''),
      routes: new RoutesService(),
      memberProviders: new MemberProviderRegistry(),
    };

    //defaultMembersRepositoryRegistry.register('LocalDatabaseMembers', new LocalDatabaseMembersProvider(repo, this.log));
    instance.memberProviders.register(MemberProviderType.D4H, new D4HMembersProvider());
  }
  return instance;
}