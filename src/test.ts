import { Apollo } from './app';

const config = Apollo({
  appId: 'mind-server',
  host: 'http://49.232.15.194:31514',
  cluster: 'nuc',
  namespaceList: [
    'application',
    'nuc.mongodb',
    'tx.redis',
  ],
});
console.log(config)