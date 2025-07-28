import Link from "next/link";
import { UmmahConnectLogo } from "@/components/icons";

export default function MobileHeader() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-center px-4 py-3 bg-background/80 backdrop-blur-sm border-b">
      <Link href="/" className="flex items-center gap-2">
        <UmmahConnectLogo className="w-7 h-7 text-primary" />
        <h1 className="text-xl font-headline font-bold text-primary">UmmahConnect</h1>
      </Link>
    </header>
  );
}
