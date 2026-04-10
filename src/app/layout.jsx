// src/app/layout.jsx
import "./globals.css";
import Providers from "@/components/shared/Providers";

export const metadata = {
  title: "AKij Resource",
  description:
    "AKij Resource online assessment platform for employers and candidates",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
