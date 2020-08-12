interface ApolloConfig {
  /** 默认值 http://127.0.0.1:8080 */
  host?: string;
  appId: string;
  /** 默认值default */
  cluster?: string;
  /** 默认值['application'] */
  namespace: string[];
  /** 密钥 */
  secret?: string;
}

interface Notification {
  namespaceName: string;
  notificationId: number;
  messages: {
    details: { [key: string]: string };
  }
}

interface ConfigResult {
  appId: string;
  cluster: string;
  namespaceName: string;
  configurations: { [key: string]: string };
  releaseKey: string;
}