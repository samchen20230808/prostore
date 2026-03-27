import { Button } from "@/components/ui/button";
import ModeToggle from "./mode-toggle";
import Link from "next/link";
import { EllipsisVerticalIcon, ShoppingCartIcon, UserIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Menu() {
  return (
    <div className="flex justify-end gap-3">
      <nav className="hidden md:flex w-full max-w-xs gap-1">
        <ModeToggle />
        <Button variant="ghost">
          <Link href="/cart" className="flex gap-2 items-center">
            <ShoppingCartIcon /> Cart
          </Link>
        </Button>
        <Button>
          <Link href="/signin" className="flex gap-2 items-center">
            <UserIcon /> Sign In
          </Link>
        </Button>
      </nav>
      <nav className="md:hidden">
        <Sheet>
          <SheetTrigger className="align-middle">
            <EllipsisVerticalIcon />
          </SheetTrigger>
          <SheetContent className="flex flex-col items-start">
            <SheetTitle>Menu</SheetTitle>
            <ModeToggle />
            <Button variant="ghost">
              <Link href="/cart" className="flex gap-2 items-center">
                <ShoppingCartIcon /> Cart
              </Link>
            </Button>
            <Button>
              <Link href="/signin" className="flex gap-2 items-center">
                <UserIcon /> Sign In
              </Link>
            </Button>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}
