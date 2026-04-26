import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FunLearn Kids — Learn, Play & Grow! 🌟",
  description:
    "A fun and interactive learning platform for kids aged 5-13. Quizzes, games, daily missions, achievements, and more!",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌟</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#8b5cf6" />
      </head>
      <body className="min-h-screen antialiased bg-background font-sans">
        {children}
      </body>
    </html>
  );
}
