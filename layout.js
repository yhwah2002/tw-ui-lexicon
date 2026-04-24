export const metadata = {
  title: '台灣 UI 用詞建議系統',
  description: '大陸用語 → 台灣 UI 用詞查詢與詞庫管理',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#f9f9f8' }}>
        {children}
      </body>
    </html>
  );
}
