import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.luxe.ecommerce',
  appName: 'Luxe Commerce',
  webDir: 'public', // Using public temporarily since Next.js output can't be easily static exported due to APIs
  server: {
    url: 'http://10.0.2.2:3000', // Android emulator alias for host localhost
    cleartext: true
  }
};

export default config;
