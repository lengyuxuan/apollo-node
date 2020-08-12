import { ApolloClient } from './client';
import * as crypto from 'crypto';

// const client = new ApolloClient({
//   appId: '23424',
//   cluster: 'nuc',
//   namespace: [
//     'TEST2.mongo',
//   ],
//   secret: 'd7a90d1cc5a3468489dcb4086e7618d7',
// });

// setInterval(() => {
//   console.log(JSON.stringify(client.config));
// }, 1000);

function getHeader(url) {
  const timestamp = Date.now().toString();
  return { Timestamp: timestamp, Authorization: `Apollo 23424:${ signature(url, timestamp) }` };
}

function signature(url, timestamp) {
  const str = `${ timestamp }\n${ url }`;
  const hash = crypto.createHmac('sha256', 'd7a90d1cc5a3468489dcb4086e7618d7');
  const sign = hash.update(str, 'utf8').digest('hex');
  return Buffer.from(sign).toString('base64');
}

console.log(getHeader(`/configs/23424/nuc/application`));