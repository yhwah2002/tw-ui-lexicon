# 台灣 UI 用詞建議系統

大陸用語 → 台灣 UI 用詞查詢與詞庫管理工具。

## 部署到 Vercel（5 分鐘）

### 步驟 1：上傳到 GitHub
1. 在 GitHub 建立新 repo（例如 `tw-ui-lexicon`）
2. 把這個資料夾的所有檔案上傳進去

### 步驟 2：部署到 Vercel
1. 前往 [vercel.com](https://vercel.com) 登入
2. 點 **Add New Project** → 選剛才的 GitHub repo
3. Framework 會自動偵測為 **Next.js**，直接點 **Deploy**

### 步驟 3：設定 API Key
1. 部署完成後，進入 Vercel 專案頁面
2. 點 **Settings** → **Environment Variables**
3. 新增：
   - Name: `ANTHROPIC_API_KEY`
   - Value: 你的 Anthropic API key（從 [console.anthropic.com](https://console.anthropic.com) 取得）
4. 點 **Save**，然後回到 **Deployments** 重新部署一次（Redeploy）

完成！你的工具就上線了。

## 本地開發

```bash
npm install
# 建立 .env.local 並填入：
# ANTHROPIC_API_KEY=your_key_here
npm run dev
```

## 功能說明

- **查詢**：輸入詞彙 → AI 分析台灣最適合的 UI 用詞 → 核准 / 修改 / 拒絕
- **詞庫**：管理已審核的詞彙，可搜尋、刪除、匯出 CSV
- 詞庫存在瀏覽器 localStorage，同一台電腦的團隊成員共用（若需跨裝置共用，可改接資料庫）
