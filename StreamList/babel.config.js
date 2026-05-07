const path = require('path');
const fs = require('fs');

function dotenvMtime() {
  try {
    return fs.statSync(path.resolve(__dirname, '.env')).mtimeMs;
  } catch {
    return 'missing';
  }
}

module.exports = function (api) {
  api.cache.using(
    () =>
      `${process.env.NODE_ENV ?? 'development'}:${dotenvMtime()}`,
  );
  const isTest = process.env.NODE_ENV === 'test';

  const plugins = [];
  if (!isTest) {
    plugins.push([
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        // Absolute path so Metro always finds .env even if cwd is not project root
        path: path.resolve(__dirname, '.env'),
        safe: false,
        allowUndefined: true,
      },
    ]);
  }

  return {
    presets: ['module:@react-native/babel-preset'],
    plugins,
  };
};
