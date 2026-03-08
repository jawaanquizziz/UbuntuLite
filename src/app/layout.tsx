import type { Metadata } from 'next';
import './globals.css';
import './terminal.css';

export const metadata: Metadata = {
  title: "UbuntuLite",
  description: "Web Terminal Simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Ubuntu+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
