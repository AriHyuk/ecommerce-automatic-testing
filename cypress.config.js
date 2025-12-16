const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    // 1. TAMBAHKAN BARIS INI (PENTING!)
    chromeWebSecurity: false, 
    
    // Config lainnya biarkan saja
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'https://ptkundalinicahayamakmur.com', // Sesuaikan jika ada
    viewportWidth: 1280,
    viewportHeight: 720,
  },
});