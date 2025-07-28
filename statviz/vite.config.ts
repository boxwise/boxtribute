import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: '../shared-components/assets/fonts/*',
          dest: 'fonts'
        },
        {
          src: '../shared-components/assets/icons/*',
          dest: '.'
        },
        {
          src: '../shared-components/assets/manifest.json',
          dest: '.'
        }
      ]
    })
  ],
  server: {
    host: true,
    port: 5173,
  },
  envPrefix: "STATVIZ_",
});
