import localFont from "next/font/local";
import "./globals.css";
import { SessionProvider } from "next-auth/react"; // For wrapping the children
import { auth } from "@/auth";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "IndeJuice Logistics",
  description: "Logistic Solution for your business",
};

export default async function RootLayout({ children }) {
  const session = await auth(); // Get the session on the server side

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
