### 携程Apollo配置中心客户端

#### 更新日志

##### v0.0.2
支持秘钥

##### v0.0.1
支持同步获取配置数据，防止await/async污染
支持实时推送

#### 使用方式
```typescript
import { ApolloClient } from '@fangjinlyx/apollo-node';

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
```