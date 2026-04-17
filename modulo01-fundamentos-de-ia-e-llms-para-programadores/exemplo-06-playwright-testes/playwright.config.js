// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 5000,
  use: {
    baseURL: 'https://mandrado.github.io/vanilla-js-web-app-example/',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chrome', headless: false },
    },
  ],
  reporter: [['html', { open: 'never' }]],
});
