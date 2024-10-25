import { Inter } from "next/font/google";
import Head from "next/head";
import "./ui/globals.css";
import Navbar from './ui/main/navbar/Navbar';
import styles from './ui/main/main.module.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Punchout Reports",
  description: "www.punchoutreports.com",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en"> {/* Include the <html> tag */}
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/favicon-48x48.png" sizes="48x48" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Punchout Reports" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <body className={inter.className}> {/* Include the <body> tag */}
        <div className={styles.container}>
          <div className={styles.navbar}>
            <Navbar />
          </div>
          <div className={styles.content}>
            <div className={styles.opacity}>
              {children}
            </div>
          </div>
          <div className={styles.footer}>
            <div>Punchout Reports</div>
            <div>© 2024 Punchout Reports. All rights reserved by Punchout Reports.</div>
          </div>
        </div>
      </body>
    </html>
  );
}
