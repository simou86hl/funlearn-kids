import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FunLearn Kids - Educational Quizzes, Games & Activities",
  description: "A fun and interactive learning platform for kids aged 5-13. Quizzes, games, daily missions, and achievements!",
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
      <body className="min-h-screen antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
