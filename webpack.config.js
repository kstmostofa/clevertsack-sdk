const path = require('path');
const fs = require('fs');
const readline = require('readline');

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

  return {
    entry: './src/index.js',
    output: {
      path: path.dirname(path.resolve(__dirname, outputFile)),
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
    },
  };
};
