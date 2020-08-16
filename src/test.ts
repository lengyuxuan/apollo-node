import { ApolloClient } from './client';

interface Config {
  key1: string;
  key2: number;
  key3: boolean,
  mongoDb: {
    url: string,
  },
  redis: {
    port: number,
    host: string,
    password: string,
  }
}

const client = new ApolloClient<Config>({
  appId: 'lock-server',
  cluster: 'nuc',
  namespace: [
    'nuc.mongodb',
  ],
  host: 'http://192.168.8.8:8080',
  secret: 'b27a01fea3bd4f23a83e3261be146036',
  configConstructor: {
    key1: String,
    key2: Number,
    key3: Boolean,
    mongodb: {
      url: String,
    },
    redis: {
      port: Number,
      host: String,
      password: String,
    },
  },
  sync: true,
}, (config: Config) => {
  console.log(config);
});

client.changeEvent.on('redis.port', (notify) => {
  console.log(notify);
});

client.changeEvent.on('key1', (notify) => {
  console.log(notify);
});

client.changeEvent.on('mongodb.url', (notify) => {
  console.log(notify);
});
