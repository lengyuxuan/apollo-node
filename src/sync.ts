import * as apollo from 'ctrip-apollo';

const namespaceList = process.env.NAMESPACE_LIST.split(',');
const client = apollo({
  appId: process.env.APP_ID,
  host: process.env.HOST,
  cluster: process.env.CLUSTER,
  namespaceList,
});

const config = {};
const taskList = [];
for (const name of namespaceList) {
  const nsp = client.namespace(name);
  const task = nsp.ready().then(() => {
    const nspConfig = nsp.config();
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
  taskList.push(task);
}

Promise.all(taskList).then(() => {
  console.log(JSON.stringify(config));
  process.exit(0);
});