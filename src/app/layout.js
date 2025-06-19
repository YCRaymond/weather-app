import './globals.css'

export const metadata = {
  title: '天氣行事曆',
  description: '結合中央氣象局天氣資訊的行事曆應用',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}
