const path = require('path');
const fs = require('fs');
const readline = require('readline');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const distDir = path.resolve(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askVersion() {
  return new Promise((resolve) => {
    const versionFolders = fs.readdirSync(distDir)
      .filter(f => fs.lstatSync(path.join(distDir, f)).isDirectory())
      .sort();
    const latestVersionDir = versionFolders.pop();
    
    const currentVersionText = latestVersionDir ? ` (Current version: ${latestVersionDir})` : '';
    const questionText = `Enter version code${currentVersionText} (or press Enter to use the latest version): `;

    rl.question(questionText, (versionCode) => {
      if (versionCode) {
        const newVersionPath = path.resolve(distDir, versionCode);
        if (!fs.existsSync(newVersionPath)) {
          fs.mkdirSync(newVersionPath);
        }
        resolve(`dist/${versionCode}/cleverstack-sdk.js`);
      } else if (latestVersionDir) {
        resolve(`dist/${latestVersionDir}/cleverstack-sdk.js`);
      } else {
        const defaultVersionPath = path.resolve(distDir, '1.0.0');
        if (!fs.existsSync(defaultVersionPath)) {
          fs.mkdirSync(defaultVersionPath);
        }
        resolve('dist/1.0.0/cleverstack-sdk.js');
      }

      rl.close();
    });
  });
}

module.exports = async () => {
  const outputFile = await askVersion();
  const outputDir = path.dirname(path.resolve(__dirname, outputFile));

  return {
    entry: './src/index.js',
    output: {
      path: outputDir,
      filename: path.basename(outputFile),
      libraryTarget: 'umd',
    },
    mode: 'production',
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx'],
      // Force a SINGLE copy of React/React-DOM. The widget (@cleverstack/
      // dialer-widget) declares react as a peerDependency, but when it is
      // linked from source (file:) its own node_modules/react can get bundled
      // alongside this wrapper's react, producing two React instances and
      // "Invalid hook call" (React error #321) → blank page. Aliasing pins
      // every react/react-dom import to this repo's single copy.
      alias: {
        react: path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      },
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'media'),
            to: path.resolve(outputDir, 'media'),
          },
        ],
      }),
    ],
  };
};
