import { readFileSync } from 'fs';
import path from 'path';
import updateNotifier from 'update-notifier';

let pkg = {
  name: process.env.npm_package_name || '@vitorsss/postman-cli',
  version: process.env.npm_package_version || '0.0.0',
};
if (require.main) {
  try {
    pkg = JSON.parse(
      readFileSync(
        path.join(path.dirname(require.main.filename), '../package.json'),
        'utf-8'
      )
    );
  } catch (err) {
    pkg = JSON.parse(
      readFileSync(
        path.join(path.dirname(require.main.filename), 'package.json'),
        'utf-8'
      )
    );
  }
}

export const version = pkg.version;
export const name = pkg.name;

export async function checkUpdate() {
  const notifier = updateNotifier({ pkg });
  notifier.notify({defer: true});
}
