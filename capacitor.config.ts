import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.luxe.ecommerce',
  appName: 'Luxe Commerce',
  webDir: 'public', // Using public temporarily since Next.js output can't be easily static exported due to APIs
  server: {
    url: 'https://ecommerce-demo.vercel.app', // Update this to your deployed production URL
    cleartext: true
  }
};

export default config;
