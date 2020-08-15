import got from 'got';
import { getHeader } from './signature';

const urlPrefix = process.env.URL_PREFIX;
const list = process.env.NAMESPACE.split(',');
const secret = process.env.SECRET;

(async () => {
  const config = {};
  for (const name of list) {
    const url = `${ urlPrefix }/${ name }`;
    const res = await got.get<ConfigResult>(url, {
      responseType: 'json',
      headers: getHeader(url, secret),
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