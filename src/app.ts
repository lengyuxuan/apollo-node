import { spawnSync } from 'child_process';
import * as apollo from 'ctrip-apollo';
import { EventEmitter } from 'events';
import { appendFile } from 'fs';
import { SSL_OP_TLS_ROLLBACK_BUG } from 'constants';

interface ApolloConfig {
  // 服务地址
  host: string;
  // 应用id
  appId: string;
  // 集群名称
  cluster: string;
  namespaceList: string[];
}

export function Apollo(apolloConfig: ApolloConfig) {
  const config = {};
  const event = new EventEmitter();
  event.on('change', ({ namespace, key, oldValue, newValue }) => {
    console.log(`命名空间[${namespace}]的[${key}]属性由[${oldValue}] 变更为[${newValue}]`);
    if (namespace !== 'application') {
      // 去掉部门前缀
      const obj = config[namespace.replace(/^.+?\./, '')];
      if (obj) {
        obj[key] = newValue;
      }
      console.log(config);
      return;
    }
    config[key] = newValue;
    console.log(config);
  });
  const client = apollo({
    appId: apolloConfig.appId,
    cluster: apolloConfig.cluster,
    host: apolloConfig.host,
  });
  // 命名空间去重
  apolloConfig.namespaceList = [...new Set(apolloConfig.namespaceList)];
  const taskList = [];
  for (const name of apolloConfig.namespaceList) {
    const namespace = client.namespace(name);
    namespace.on('change', ({ key, oldValue, newValue }) => {
      event.emit('change', {
        namespace: name,
        key,
        oldValue,
        newValue,
      });
    });
    namespace.ready();
    const task = namespace.ready().then(() => {
      const nspConfig = namespace.config();
      // 去掉部门前缀
      const publicName = name.replace(/^.+?\./, '');
      if (name !== 'application') {
        config[publicName] = {};
      }
      for (const [key, value] of Object.entries(nspConfig)) {
        name !== 'application' ? (config[publicName][key] = value) : (config[key] = value);
      }
      Object.assign(config, nspConfig);
    });
  }
  // const result = spawnSync('node', ['sync.js'], {
  //   env: {
  //     APP_ID: apolloConfig.appId,
  //     NAMESPACE_LIST: apolloConfig.namespaceList.join(','),
  //     HOST: apolloConfig.host,
  //     CLUSTER: apolloConfig.cluster,
  //   },
  //   cwd: __dirname,
  // });
  // Object.assign(config, JSON.parse(result.output[1]));
  return config;
}
