export const metadata = {
  title: '🎡 Wheel of Fortune - Project Rewards',
  description: 'Gamified project rewards with a wheel of fortune spinner',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
