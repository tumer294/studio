
import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { AuthProvider } from '@/hooks/use-auth-provider';
import { TranslationProvider } from '@/hooks/use-translation';

export const metadata: Metadata = {
  title: 'UmmahConnect',
  description: 'A social media platform for the Ummah.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <TranslationProvider>
            {children}
            <Toaster />
          </TranslationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
