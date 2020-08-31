import got from 'got';
import { debuglog } from 'util';
import { spawnSync } from 'child_process';
import { address } from 'ip';
import { getHeader } from './signature';
import { EventEmitter } from 'events';
import { ConfigConstructor, Option, Notification, ConfigResult } from './typing';

interface ChangeEvent extends EventEmitter {
  on(event: string, listener: (notify: {
    namespaceName: string;
    newValue: any;
    oldValue: any;
  }) => void): this;
}

interface NamespaceChangeEvent extends EventEmitter {
  on(namespaceName: string, listener: (notify: {
    namespaceName: string;
    changeList: { newValue: any, oldValue: any }[];
  }) => void): this;
}

const debug = debuglog('APOLLO_CLIENT');
export class ApolloClient<T> {
  // 配置
  public config: T;
  // 本机ip，灰度发布使用
  public ip = address();
  // 配置更新事件
  public changeEvent: ChangeEvent = new EventEmitter();
  // namespace更新事件
  public namespaceChangeEvent: NamespaceChangeEvent = new EventEmitter();
  // apollo地址
  private host: string = 'http://127.0.0.1:8080';
  // 应用id
  private appId: string = '';
  // 集群名称
  private cluster: string = 'default';
  // 命名空间
  private namespace: string[] = ['application'];
  // 更新配置时，服务端用来检测是否为最新版本
  private releaseKey: string = '';
  // 秘钥(可选)
  private secret: string = '';
  // 配置构造器
  private configConstructor: ConfigConstructor = null;

  constructor(option: Option, callback?: (config: T) => void) {
    this.host = option.host || this.host;
    this.appId = option.appId;
    this.cluster = option.cluster || this.cluster;
    if (option.secret) {
      this.secret = option.secret;
    }
    if (Array.isArray(option.namespace)) {
      this.namespace.push(...option.namespace);
      this.namespace = [...new Set(this.namespace)];
    }
    if (option.sync) {
      if (typeof callback === 'function') {
        console.warn('when sync is true then not call callback!')
      }
      this.getConfigSync();
    } else {
      if (typeof callback !== 'function') {
        throw new Error('when sync is false then callback must be existed!');
      }
      this.config = {} as any;
      const task = [];
      for (const name of this.namespace) {
        task.push(this.updateConfig(name));
      }
      Promise.all(task).then(() => {
        callback(this.config);
      });
    }
    if (option.configConstructor) {
      this.configConstructor = option.configConstructor;
      this.format(this.config, this.configConstructor);
    }
    this.listenChange();
  }
  /**
   * 监听namespace变动
   */
  private async listenChange() {
    const notifications = this.namespace.map((item) => {
      return { namespaceName: item, notificationId: -1 };
    });
    while (true) {
      try {
        const url = `${this.host}/notifications/v2?appId=${this.appId}&cluster=${this.cluster}&notifications=${encodeURI(JSON.stringify(notifications))}`
        const res = await got.get<Notification[]>(url, { responseType: 'json', headers: getHeader(url, this.secret) });
        const noteList = res.body;
        if (res.statusCode === 304) {
          debug('no change');
        } else if (res.statusCode === 200) {
          for (const note of noteList) {
            for (const item of notifications) {
              if (item.namespaceName === note.namespaceName) {
                item.notificationId = note.notificationId;
                this.updateConfig(note.namespaceName);
                break;
              }
            }
          }
        }
      } catch (error) {
        console.log('listen change error', error);
      }
    }
  }

  private getConfigSync() {
    const url = `${this.host}/configs/${this.appId}/${this.cluster}`;
    const result = spawnSync('node', ['sync.js'], {
      env: {
        ...process.env,
        URL_PREFIX: url,
        NAMESPACE: this.namespace.join(','),
        SECRET: this.secret,
      },
      cwd: __dirname,
    });
    try {
      this.config = JSON.parse(result.output[1]);
    } catch (error) {
      console.error(result.output.toString(), error);
      return;
    }
  }

  /**
   * 更新配置
   * @param namespaceName 命名空间名称
   */
  private async updateConfig(namespaceName: string) {
    try {
      const url = `${this.host}/configs/${this.appId}/${this.cluster}/${namespaceName}?releaseKey=${this.releaseKey}&ip=${this.ip}`;
      const res = await got.get<ConfigResult<T>>(url, { responseType: 'json', headers: getHeader(url, this.secret) });
      if (res.statusCode === 304) {
        debug('releaseKey is same!');
        return;
      }
      if (res.statusCode !== 200) {
        console.log('get config code is', res.statusCode);
        return;
      }
      const result = res.body;
      this.releaseKey = result.releaseKey;
      if (namespaceName === 'application') {
        this.format(result.configurations, this.configConstructor);
        this.diff(this.config, result.configurations, namespaceName);
        Object.assign(this.config, result.configurations);
      } else {
        // 去掉部门前缀
        const publicName = namespaceName.replace(/^.+?\./, '');
        if (!this.config[publicName]) {
          this.config[publicName] = {};
        }
        this.format(result.configurations, this.configConstructor[publicName] as ConfigConstructor);
        this.diff(this.config[publicName], result.configurations, namespaceName);
        Object.assign(this.config[publicName], result.configurations);
      }
    } catch (error) {
      console.log('get config error', error);
    }
  }

  /**
   * 将配置项用构造器格式化
   * @param config config
   * @param configConstructor 构造器
   */
  private format(config: T, configConstructor: ConfigConstructor) {
    if (!config || !configConstructor) {
      return;
    }
    for (const [key, value] of Object.entries(configConstructor)) {
      if (typeof value !== 'object') {
        config[key] = value === Boolean ? config[key] === 'true' : value(config[key]);
      } else {
        this.format(config[key], configConstructor[key] as ConfigConstructor);
      }
    }
  }

  private diff(config: T, newConfig: T, namespaceName: string) {
    const changeList: { newValue: any, oldValue: any }[] = [];
    for (const [key, newValue] of Object.entries(newConfig)) {
      const oldValue = config[key];
      if (oldValue !== undefined && oldValue !== newValue) {
        const eventKey = namespaceName === 'application' ? key : `${ namespaceName.replace(/^.+?\./, '') }.${ key }`;
        this.changeEvent.emit(eventKey, {
          oldValue,
          newValue,
          namespaceName,
        });
        changeList.push({ oldValue, newValue });
      }
    }
    if (changeList.length > 0) {
      this.namespaceChangeEvent.emit(namespaceName.replace(/^.+?\./, ''), {
        namespaceName,
        changeList,
      });
    }
  }
}
