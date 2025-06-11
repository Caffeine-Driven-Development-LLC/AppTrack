module.exports = {
  packagerConfig: {
    appBundleId: 'com.caffeinedrivendevelopment.apptrack',
    asar: true,
    name: 'App Track',
    icon: './img/icon',
    osxSign: {
      identity: process.env.SIGN_IDENTITY,
      hardenedRuntime: true,
      entitlements: 'entitlements.plist',
    },
    osxNotarize: {
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
    },
  },
  makers: [
    {
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin'],
      config: {
        format: 'ULFO'
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-squirrel',
      config: {}
    }
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
    },
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {}
    }
  ],
};
