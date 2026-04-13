import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.waleta.systemmaintenance',
  appName: 'Waleta System Maintenance',
  webDir: 'build',
  android: {
    allowMixedContent: true
  }
};

export default config;
