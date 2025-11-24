import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    
    // Prioritize Vercel system env vars (process.env), then .env file vars (env)
    const weatherApiKey = process.env.WEATHER_API_KEY || env.WEATHER_API_KEY || process.env.VITE_WEATHER_API_KEY || env.VITE_WEATHER_API_KEY || '';
    const geminiApiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || process.env.API_KEY || env.API_KEY || '';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(geminiApiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(geminiApiKey),
        'process.env.WEATHER_API_KEY': JSON.stringify(weatherApiKey),
        'import.meta.env.VITE_WEATHER_API_KEY': JSON.stringify(weatherApiKey)
      },
      envPrefix: 'VITE_',
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
