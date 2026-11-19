import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.aftrshop.store"),
  title: {
    default: "AFTRSHOP — After the sun. On your terms.",
    template: "%s | AFTRSHOP",
  },
  description: "Streetwear for the ones who make their own way. Discover the AFTRSHOP after-dark collection.",
  openGraph: {
    type: "website",
    siteName: "AFTRSHOP",
    title: "AFTRSHOP — After the sun. On your terms.",
    description: "Streetwear for the ones who make their own way.",
    images: [{ url: "/assets/after-dark-campaign.png", width: 1536, height: 1024, alt: "AFTRSHOP after-dark city campaign" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AFTRSHOP — After the sun. On your terms.",
    description: "Streetwear for the ones who make their own way.",
    images: ["/assets/after-dark-campaign.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#090908",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
