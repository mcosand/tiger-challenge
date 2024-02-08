import crypto from 'crypto';
import axios from 'axios';
import { CalTopoApiResponse, CalTopoBookmark, CalTopoMap } from '@challenge/types/caltopo';

export function generateCalTopoVerificationToken() {
  return [...Array(10)].map(() => Math.random().toString(36)[2]).join('').replace('l', 'L');
}

export class CalTopoClient {
  private apiKey: string;
  private authId: string;
  private authKey: string;

  constructor(apiKey: string, authId: string, authKey: string) {
    this.apiKey = apiKey;
    this.authId = authId;
    this.authKey = authKey;
  }

  private sign(method: string, url: string, expires: number, payloadString: string) {
    const message = `${method} ${url}\n${expires}\n${payloadString}`
    const secret = Buffer.from(this.authKey, 'base64');
    let test = crypto.createHmac('sha256', secret).update(message).digest("base64");
    return test;
  }

  private createCalTopoOnlineRequest(method: string, url: string, payload?: object) {
    const payloadString = payload ? JSON.stringify(payload) : '';
    const expires = new Date().getTime() + 300 * 1000;
    const signature = this.sign(method, url, expires, payloadString);
    const parameters = {
      id: this.authId,
      expires: expires,
      signature,
      json: payloadString,
    };
    const queryString = Object.entries(parameters).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join("&");
    return {
      url: 'https://caltopo.com' + url,
      body: queryString,
    };
  }

  public async testMapAccess(id: string) {
    const signed = this.createCalTopoOnlineRequest('GET', `/api/v1/map/${id}/since/0`);
    try {
      const response = await axios.get(signed.url);
      return response.status === 200;
    } catch (err) {
      return false;
    }
  }

  public async getMap(id: string, since?: number): Promise<CalTopoMap> {
    const signed = this.createCalTopoOnlineRequest('GET', `/api/v1/map/${id}/since/${since ?? 0}`);
    try {
      const response = await axios.get(`${signed.url}?${signed.body}`);
      return response.data.result;
    } catch (err) {
      this.handleApiError(err);
      throw err;
    }
  }

  public async createBookmark(mapId: string, authCode?: string): Promise<CalTopoBookmark> {
    const payload = {
      properties: {
        mapId,
        accountId: this.apiKey,
      },
      code: authCode,
    };

    const signed = this.createCalTopoOnlineRequest('POST', '/api/v1/rel/UserAccountMapRel', payload);
    try {
      const response = await axios.post<CalTopoApiResponse<CalTopoBookmark>>(signed.url, signed.body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
      return response.data.result;
    } catch (err) {
      this.handleApiError(err);
      throw err;
    }
  }

  private handleApiError(err: unknown) {
    if (typeof err === 'object' && !!err) {
      const errObject = err as any;
      if (errObject?.response?.data?.status === 'error') {
        // assume it's a CalTopo API error
        throw {
          ...errObject.response.data,
          code: errObject.response.status,
        }
      }
    }
  }
}
