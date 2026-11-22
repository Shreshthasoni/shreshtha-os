import { defineConfig } from "vite";
import { sitePlugin } from "./build/site-plugin.ts";

export default defineConfig({
  plugins: [sitePlugin()],
  build: { target: "es2022" }
});
