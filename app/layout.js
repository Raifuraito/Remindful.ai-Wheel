import './globals.css';

export const metadata = {
  title: 'Reward Arcade',
  description: 'Rewards, mini-games, pets, streaks, and admin tuning.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
