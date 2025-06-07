module.exports = {
  packagerConfig: {
    asar: true,
    name: 'App Track',
    icon: './img/icon',
  },
  rebuildConfig: {},
  makers: [
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.cjs',
        renderer: {
          config: './webpack.render.config.cjs',
          entryPoints: [{
            name: 'main_window',
            html: './src/html/index.html',
            js: './src/js/render/main-window/renderer.js',
            preload: {
              js: './src/js/render/main-window/preload.js'
            }
          }]
        }
      }
    }
  ],
};
