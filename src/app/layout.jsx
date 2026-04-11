
import "./globals.css";
import Providers from "@/components/shared/Providers";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata = {
  title: "AKij Resource",
  description:
    "AKij Resource online assessment platform for employers and candidates",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={cn("h-full", "font-sans", geist.variable)}>
      <body className="h-full antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
