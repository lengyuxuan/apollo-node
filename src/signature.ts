import * as crypto from 'crypto';
import { parse as urlParse } from 'url';

export function getHeader(appId: string, url: string, secret?: string) {
  const timestamp = Date.now().toString();
  return secret ? {
    Timestamp: timestamp,
    Authorization: `Apollo ${appId}:${ signature(urlParse(url).path, timestamp, secret) }`,
  } : {};
}

function signature(url: string, timestamp: string | number, secret: string) {
  const str = `${ timestamp }\n${ url }`;
  return crypto.createHmac('sha1', secret).update(str).digest('base64');
}
