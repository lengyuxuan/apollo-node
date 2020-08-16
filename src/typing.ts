export interface Option {
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

export interface Notification {
  namespaceName: string;
  notificationId: number;
  messages: {
    details: { [key: string]: string };
  }
}

export interface ConfigResult<T> {
  appId: string;
  cluster: string;
  namespaceName: string;
  configurations: T;
  releaseKey: string;
}

export type SelfConstructor = <T>(value: string) => T;

export interface ConfigConstructor {
  [key: string]: SelfConstructor | ConfigConstructor;
}