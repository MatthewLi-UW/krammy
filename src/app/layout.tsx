import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from '@/app/themeprovider';

export const metadata: Metadata = {
  title: "Krammy",
  description: "Krammy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}