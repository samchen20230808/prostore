"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

export default function ProductImages({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  // console.log("ProductImages", images);
  return (
    <div className="space-y-4">
      <Image
        src={images[current] || "/images/no-picture.png"}
        alt="product image"
        width={1000}
        height={1000}
        className="aspect-square object-cover"
      />
      <div className="flex">
        {images.map((img, index) => (
          <div
            key={img}
            onClick={() => setCurrent(index)}
            className={cn(
              "border-2 mr-2 cursor-pointer hover:border-orange-600",
              current === index && "border-orange-500",
            )}
          >
            <Image
              src={img || "/images/no-picture.png"}
              alt="image"
              width={100}
              height={100}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
