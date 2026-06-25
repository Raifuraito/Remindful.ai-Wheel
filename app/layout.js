export const metadata = {
  title: '🎡 DevWheel — Project Rewards',
  description: 'Gamified project reward system with ticket mechanic, weighted wheel, and elite spins',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#050810' }}>
        {children}
      </body>
    </html>
  );
}
