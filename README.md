# Usage

```typescript
import { ApolloClient } from './client';

interface Config {
  key1: string;
  key2: number;
  key3: boolean,
  // 此处的mongodb和redis分别对应两个namespace下的数据，部门名称会被自动去除
  mongodb: {
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
  // 以同步的方式获取配置
  sync: true,
});

console.log(client.config);

// 监听key值变动
client.changeEvent.on('key1', (notify) => {
  console.log(notify);
});

// 监听某个namespace下的key值变动
client.changeEvent.on('mongodb.url', (notify) => {
  console.log(notify);
});

// 监听namespace，其下任何值发生变化都会触发事件
client.namespaceChangeEvent.on('redis', (notify) => {
  console.log(notify);
});

```

# Change Log

## v0.0.13
* 文档修正

## v0.0.12

### Bug Fixes
* 签名时appId被写死

------------------------------------------

> 以下版本有致命bug，不推荐使用

## v0.0.11

### Bug Fixes
* 由于给spawnSync设置env属性，所以子进程无法继承父进程的process.env，这会导致$PATH也无法被继承，一些常用命令如node无法找到会报错

## v0.0.9

### Bug Fixes
* 修复文档说明错误

## v0.0.8

### New Feature
* 新增监听namespa变动

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

client.namespaceChangeEvent.on('redis', (notify) => {
  console.log(notify);
});
```

## v0.0.7

### New Feature
* 支持秘钥

```typescript
const client = new ApolloClient<Config>({
  secret: '18b079a14e9c43ca83374f614da793b4',
  // ...
});
```

* 支持同步获取配置数据，防止await/async污染

```typescript
const client = new ApolloClient<Config>({
  sync: true,
  // ...
});
console.log(client.config);
```

* 支持实时推送

* 配置类型泛形
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
}, (config: Config) => {
  console.log(config);
});
```
> 当设置sync不为true的时候必须传入callback回调

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
