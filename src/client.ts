import got from 'got';
import { debuglog } from 'util';
import { spawnSync } from 'child_process';
import { address } from 'ip';
import { getHeader } from './signature';

const debug = debuglog('APOLLO_CLIENT');
export class ApolloClient {
  public config = {};
  public ip = address();
  private host: string = 'http://127.0.0.1:8080';
  private appId: string = '';
  private cluster: string = 'default';
  private namespace: string[] = ['application'];
  private releaseKey: string = '';
  private secret: string = '';

  constructor(option: ApolloConfig) {
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
    const url = `${this.host}/configs/${this.appId}/${this.cluster}`;
    const result = spawnSync('node', ['sync.js'], {
      env: {
        URL_PREFIX: url,
        NAMESPACE: this.namespace.join(','),
        SECRET: this.secret,
      },
      cwd: __dirname,
    });
    try {
      const config = JSON.parse(result.output[1]);
      Object.assign(this.config, config);
    } catch (error) {
      console.error(result.output.toString(), error);
      return;
    }
    this.listenChange();
  }

  private async listenChange() {
    const notifications = this.namespace.map((item) => {
      return { namespaceName: item, notificationId: -1 };
    });
    while (true) {
      try {
        const url = `${this.host}/notifications/v2?appId=${this.appId}&cluster=${this.cluster}&notifications=${encodeURI(JSON.stringify(notifications))}`
        const res = await got.get<Notification[]>(url, { timeout: 61 * 1000, responseType: 'json', headers: getHeader(url, this.secret) });
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

  private async updateConfig(namespaceName: string) {
    try {
      const url = `${this.host}/configs/${this.appId}/${this.cluster}/${namespaceName}?releaseKey=${this.releaseKey}&ip=${this.ip}`;
      const res = await got.get<ConfigResult>(url, { responseType: 'json', headers: getHeader(url, this.secret) });
      if (res.statusCode === 304) {
        debug('releaseKey is same!');
        return;
      }
      if (res.statusCode !== 200) {
        console.log('get config code is', res.statusCode);
        return;
      }
      const config = res.body;
      this.releaseKey = config.releaseKey;
      if (namespaceName === 'application') {
        Object.assign(this.config, config.configurations);
      } else {
        // 去掉部门前缀
        const publicName = namespaceName.replace(/^.+?\./, '');
        if (!this.config[publicName]) {
          this.config[publicName] = {};
        }
        Object.assign(this.config[publicName], config.configurations);
      }
    } catch (error) {
      console.log('get config error', error);
    }
  }
}
