import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: 'ChatCrate',
    version: '0.0.1',
    permissions: ['activeTab', 'scripting'],
  },
  modules: ['@wxt-dev/module-react'],
});

