import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Roboto, Poppins, Lato, Open_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from 'sonner';
import { Footer } from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const roboto = Roboto({
  weight: ['400', '500', '700'],
  variable: "--font-roboto",
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  variable: "--font-poppins",
  subsets: ["latin"],
});

const lato = Lato({
  weight: ['400', '700'],
  variable: "--font-lato",
  subsets: ["latin"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export const metadata: Metadata = {
  title: "House of Tech - AI Collaborative Workspace",
  description: "AI-powered collaborative document workspace with real-time editing and intelligent writing assistance.",
  applicationName: "House of Tech",
  appleWebApp: {
    title: "House of Tech",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "House of Tech - AI Collaborative Workspace",
    description: "AI-powered collaborative document workspace with real-time editing and intelligent writing assistance.",
    url: "https://houseoftech.com", // Example URL
    siteName: "House of Tech",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "House of Tech - AI Collaborative Workspace",
    description: "AI-powered collaborative document workspace with real-time editing and intelligent writing assistance.",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${roboto.variable} ${poppins.variable} ${lato.variable} ${openSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Footer />
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
