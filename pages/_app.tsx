import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import Head from "next/head";
import { Toaster } from "@/components/ui/toaster";
import { GoogleAnalytics } from "nextjs-google-analytics";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={inter.className}>
      <Head>
        <title>agentglide</title>
      </Head>
      <Component {...pageProps} />
      <GoogleAnalytics trackPageViews />
      <Toaster />
    </main>
  );
}
