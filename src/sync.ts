import got from 'got';

const url = process.env.URL;
const list = process.env.NAMESPACE.split(',');
const headers = JSON.parse(process.env.HEADER);

(async () => {
  const config = {};
  for (const name of list) {
    const res = await got.get<ConfigResult>(url + '/' + name, { responseType: 'json', headers });
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