"use client";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { MenuIcon } from "lucide-react";
import Link from "next/link";

export default function CategoryList({ categories }: { categories: any[] }) {
  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <Button variant="outline">
          <MenuIcon />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full max-w-sm">
        <DrawerHeader>
          <DrawerTitle className="mt-4">Select a category</DrawerTitle>
          <div className="space-y-2 mt-4">
            {categories.map((item) => (
              <DrawerClose key={item.category} asChild>
                <Link
                  href={`/search?category=${item.category}`}
                  className="block text-start hover:bg-accent p-1 rounded-md"
                >
                  {item.category} ({item._count})
                </Link>
              </DrawerClose>
            ))}
          </div>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
}
