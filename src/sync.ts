/**
 * 本文件将以spawnSync的形式被执行，目的是同步获取一次完整的配置文件
 */
import got from 'got';
import { getHeader } from './signature';
import { ConfigResult } from './typing';

const urlPrefix = process.env.URL_PREFIX;
const list = process.env.NAMESPACE.split(',');
const secret = process.env.SECRET;
const appid = process.env.APPID;

(async () => {
  const config = {};
  for (const name of list) {
    const url = `${ urlPrefix }/${ name }`;
    const res = await got.get<ConfigResult<{[key: string]: string}>>(url, {
      responseType: 'json',
      headers: getHeader(appid, url, secret),
    });
    if (name === 'application') {
      Object.assign(config, res.body.configurations);
    } else {
      // 去掉部门前缀
      const publicName = name.replace(/^.+?\./, '');
      if (!config[publicName]) {
        config[publicName] = {};
      }
      Object.assign(config[publicName], res.body.configurations);
    }
  }
  console.log(JSON.stringify(config));
})();
