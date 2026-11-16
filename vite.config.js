import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
    plugins: [react(), VitePWA({ registerType: 'autoUpdate', manifest: { name: 'Seguridad CryptoLab', short_name: 'CryptoLab', lang: 'es', start_url: '/', display: 'standalone', theme_color: '#1849a9', background_color: '#faf8f1', icons: [] }, workbox: { navigateFallback: '/index.html' } })],
    test: { environment: 'jsdom', setupFiles: './src/tests/setup.ts', coverage: { reporter: ['text', 'html'] } },
});
