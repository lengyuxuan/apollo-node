### 携程Apollo配置中心客户端

#### 更新日志

##### v0.0.12
修复签名时appId被写死的问题

##### v0.0.11
###### 由于给spawnSync设置env属性，所以子进程无法继承父进程的process.env，这会导致$PATH也无法被继承，一些常用命令如node无法找到会报错

##### v0.0.9
###### 修复文档说明错误

##### v0.0.8
###### 新增监听namespa变动

```typescript
interface Config {
  key1: string;
  key2: number;
}
const client = new ApolloClient<Config>({
  appId: 'mind-server',
  cluster: 'nuc',
  namespace: [
    'nuc.mongodb',
    'tx.redis',
  ],
});

client.changeEvent.on('redis', (notify) => {
  console.log(notify);
});
```

##### v0.0.7
###### 支持秘钥
###### 支持同步获取配置数据，防止await/async污染
###### 支持实时推送
###### 配置类型泛形
```typescript
interface Config {
  key1: string;
  key2: number;
}
const client = new ApolloClient<Config>({
  appId: 'mind-server',
  cluster: 'nuc',
  namespace: [
    'nuc.mongodb',
    'tx.redis',
  ],
});
// client.config的类型为Config
```

###### 配置类型格式化
由于Apollo获取到的参数值只能是string类型，使用时还需要二次解析，新版本内置了类型转换：
```typescript
interface Config {
  key1: string;
  key2: number;
  key3: boolean,
  mongoDb: {
    url: string,
  },
}
const client = new ApolloClient<Config>({
  appId: 'mind-server',
  cluster: 'nuc',
  namespace: [
    'nuc.mongodb',
    'tx.redis',
  ],
  configConstructor: {
    key1: String,
    key2: Number,
    key3: Boolean,
    mongodb: {
      url: String,
    },
  },
});
console.log(client.config);
// {
//   key1: '字符串',
//   key2: 12345,
//   key3: false,
//   mongodb: {
//     url: 'mongodb://root:xx@127.0.0.1:27017/auth?authSource=admin'
//   },
//   redis: {
//     port: 6379,
//     host: '127.0.0.1',
//     password: 'xxxxxxx'
//   }
// }
```

###### 异步回调获取方式
```typescript
const client = new ApolloClient<Config>({
  appId: 'mind-server',
  cluster: 'nuc',
  namespace: [
    'nuc.mongodb',
    'tx.redis',
  ],
  secret: '18b079a14e9c43ca83374f614da793b4',
  configConstructor: {
    key1: String,
    key2: Number,
  },
  sync: true,
}, (config: Config) => {
  console.log(config);
});
```
> 当设置sync为true的时候必须传入callback回调

###### 配置更新回调
```typescript
const client = new ApolloClient<Config>({
  appId: 'mind-server',
  cluster: 'nuc',
  namespace: [
    'nuc.mongodb',
    'tx.redis',
  ],
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
});

client.changeEvent.on('key1', (notify) => {
  console.log(notify);
});

client.changeEvent.on('redis.port', (notify) => {
  console.log(notify);
});

client.changeEvent.on('mongodb.url', (notify) => {
  // 可以在此回调中进行重连
  console.log(notify);
});
```

#### 使用方式
```typescript
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
});

console.log(client.config);

client.changeEvent.on('redis.port', (notify) => {
  console.log(notify);
});

client.changeEvent.on('key1', (notify) => {
  console.log(notify);
});

client.changeEvent.on('mongodb.url', (notify) => {
  console.log(notify);
});

```