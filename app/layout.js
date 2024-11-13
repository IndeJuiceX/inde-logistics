import localFont from "next/font/local";
import "./globals.css";
import { SessionProvider } from "next-auth/react"; // For wrapping the children
import { auth } from "@/auth";
import { Figtree } from 'next/font/google'

export const metadata = {
  title: "IndeJuice Logistics",
  description: "Logistic Solution for your business",
};

const figtree = Figtree({
  subsets: ['latin'],
  display: 'swap',
})

export default async function RootLayout({ children }) {
  const session = await auth(); // Get the session on the server side

  return (
    <html lang="en">
      <body
        className={figtree.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
