export default {
  expo: {
    name: 'Base Phase App',
    slug: 'base-phase-app',
    owner: 'fiftyfivebells',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    updates: {
      url: 'https://u.expo.dev/4481c69f-9524-4ddb-98cf-aaf4020b0fae'
    },
    runtimeVersion: {
      policy: 'appVersion'
    },
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.trainingapp.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FAF8F5',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.trainingapp.app',
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: ['expo-localization', 'expo-router', 'expo-secure-store'],
    scheme: 'trainingapp',
    extra: {
      eas: {
        projectId: '4481c69f-9524-4ddb-98cf-aaf4020b0fae'  
      },
      router: {
        origin: false,
      },
      apiBaseUrl: process.env.API_BASE_URL || 'https://api.basephase.app',
    },
  },
}
