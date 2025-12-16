const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    // 1. TAMBAHKAN BARIS INI (PENTING!)
    chromeWebSecurity: false, 
    
    // Config lainnya biarkan saja
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://127.0.0.1:8000', // Sesuaikan jika ada
    viewportWidth: 1280,
    viewportHeight: 720,
  },
});