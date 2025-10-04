import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: 'ChatCrate',
    version: '0.0.1',
    permissions: ['activeTab', 'scripting', 'clipboardWrite'],
    host_permissions: [
      'https://www.perplexity.ai/*',
      'https://perplexity.ai/*'
    ],
  },
  modules: ['@wxt-dev/module-react'],
});

