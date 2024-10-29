import { Inter } from 'next/font/google';
import './ui/globals.css';
import Navbar from './ui/main/navbar/Navbar';
import styles from './ui/main/main.module.css';

const inter = Inter({ subsets: ['latin'] });

// Isolated and simplified metadata for testing purposes
export const metadata = {
  title: 'Punchout Reports',
  description: 'Simplified Metadata Test',
};

// Minimal viewport configuration
export const generateViewport = () => ({
  width: 'device-width',
  initialScale: 1,
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className={styles.container}>
          <div className={styles.navbar}>
            <Navbar />
          </div>
          <div className={styles.content}>
            <div className={styles.opacity}>{children}</div>
          </div>
          <div className={styles.footer}>
            <div>Punchout Reports</div>
            <div>
              © 2024 Punchout Reports. All rights reserved by Punchout Reports.
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
