# digitalacc
Digital aCC Website for visualizing protein interaction over aCC volumes.


### Installation for dev WebServer

1. Use ES6 dependency using modern toolsets such as Webpack, NPM. Following this [Tutorial](https://kitware.github.io/vtk-js/docs/intro_vtk_as_es6_dependency.html)
```sh
$ npm init
$ npm install vtk.js kw-web-suite --save-dev
```

2. Create `webpack.config.js` file containing the following script.
```javascript
var path = require('path');
var webpack = require('webpack');
var vtkRules = require('vtk.js/Utilities/config/dependency.js').webpack.v2.rules;
var entry = path.join(__dirname, './src/index.js');
const sourcePath = path.join(__dirname, './src');
const outputPath = path.join(__dirname, './dist');
module.exports = {
  entry,
  output: {
    path: outputPath,
    filename: 'digitalacc.js',
  },
  module: {
    rules: [
        { test: entry, loader: "expose-loader?MyWebApp" },
        { test: /\.html$/, loader: 'html-loader' },
    ].concat(vtkRules),
  },
  resolve: {
    extensions: ['.webpack-loader.js', '.web-loader.js', '.loader.js', '.js', '.jsx'],
    modules: [
      path.resolve(__dirname, 'node_modules'),
      sourcePath,
    ],
  },
};
```

3. And extend `package.json` file with the following set of scripts.
```json
{
  [...],
  "scripts": {
    "build": "webpack",
    "build:release": "webpack -p",
    "start": "webpack-dev-server --content-base ./dist",
    "commit": "git cz",
    "semantic-release": "semantic-release pre && npm publish && semantic-release post"
  }
}
```

4. Install dependencies
```sh
$ npm install vis --save-dev
```

5. Build the application
```sh
$ npm run build
```

6. Start a dev WebServer
```sh
$ npm start
```

### Folder Hierarchy
* dist
    * css -> contain style format
    * data -> contain all kinds of volume data
        * template_parts -> the template volume
        * volume -> data volumes
    * js -> contain local copy of javascript libraries
    * volumelist.txt -> contain list of availabel neuron volume and its number of timesteps.
* src
    * index.js -> main javascript code.
    * isoviewer.js -> Iso surface viewer code using *VTK.js*.
    * volumeviewer.js -> Volume rendering code using *VTK.js*.
    * proteinnetwork.js -> Protein network code using *vis.js*.
    * template.js -> Neuron template code using *three.js*.