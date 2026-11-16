// app/layout.tsx
import type { Metadata } from "next";
import { JetBrains_Mono, Poppins, Source_Sans_3 } from "next/font/google";
import "./globals.css";

// Skeleton-design fonts: Poppins for headings, Source Sans for body,
// JetBrains Mono for IDs/codes. Source Sans 3 is the renamed Source Sans Pro.
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  subsets: ["latin"],
});

const sourceSans = Source_Sans_3({
  weight: ["400", "600", "700"],
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "600"],
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Tiffin Club — Admin",
  description: "Admin console for The Tiffin Club: menus, orders, customers, and settings.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${sourceSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
