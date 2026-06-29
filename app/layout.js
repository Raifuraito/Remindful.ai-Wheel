import './globals.css'  // Your existing styles

export const metadata = {
  title: 'DevWheel',
  description: 'Spin wheels, earn rewards!',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
