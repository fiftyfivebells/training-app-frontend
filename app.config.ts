export default {
  expo: {
    name: 'training-app-frontend',
    slug: 'training-app-frontend',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
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
      router: {
        origin: false,
      },
      apiBaseUrl: process.env.API_BASE_URL || 'https://api.basephase.app',
    },
  },
}
