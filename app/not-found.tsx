import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Image
        src="/images/logo.svg"
        alt="logo"
        width={48}
        height={48}
        priority
      />
      <div className="p-6 w-2/3 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold mb-4">Not Found</h1>
        <p className="text-destructive">Could not find the requested page</p>
        <Button variant="outline" className="mt-4 ml-2">
          <Link href="/">Back To Home</Link>
        </Button>
      </div>
    </div>
  );
}
