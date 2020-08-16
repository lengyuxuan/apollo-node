interface Option {
  /** 默认值 http://127.0.0.1:8080 */
  host?: string;
  appId: string;
  /** 默认值default */
  cluster?: string;
  /** 默认值['application'] */
  namespace: string[];
  /** 密钥 */
  secret?: string;
  /** 构造器 */
  configConstructor?: any;
  /** 是否开启同步获取配置 */
  sync?: boolean;
}

interface Notification {
  namespaceName: string;
  notificationId: number;
  messages: {
    details: { [key: string]: string };
  }
}

interface ConfigResult<T> {
  appId: string;
  cluster: string;
  namespaceName: string;
  configurations: T;
  releaseKey: string;
}

type SelfConstructor = <T>(value: string) => T;

interface ConfigConstructor {
  [key: string]: SelfConstructor | ConfigConstructor;
}