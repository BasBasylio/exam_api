import { defineConfig } from "cypress";

export default defineConfig({
  viewportHeight: 1080,
  viewportWidth: 1920,
  watchForFileChanges: false,
  e2e: {
    setupNodeEvents() {},
    baseUrl: "http://localhost:3000/",
  },
});
