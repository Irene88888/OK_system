import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 使用相對路徑（"./"）作為 base，這樣不論部署到
// https://<user>.github.io/<repo>/ 或自訂網域都能正常載入資源，
// 不需要每次改 repo 名稱都手動調整。
export default defineConfig({
  plugins: [react()],
  base: "./",
});
