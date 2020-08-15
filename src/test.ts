import { ApolloClient } from './client';

const client = new ApolloClient({
  appId: 'mind-server',
  cluster: 'nuc',
  namespace: [
    'nuc.mongodb',
  ],
  host: 'http://192.168.124.8:8080',
  secret: '18b079a1xxx614da793b4',
});

setInterval(() => {
  console.log(client.config);
}, 1000);
