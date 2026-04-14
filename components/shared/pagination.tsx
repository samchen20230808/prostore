"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

type PaginationProps = {
  totalPages: number;
};
export default function Pagination({ totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = searchParams.get("page") || 1;
  const pathname = usePathname();
  function handleClick(btnType: string) {
    const pageValue =
      btnType === "next" ? Number(currentPage) + 1 : Number(currentPage) - 1;
    // console.log({ page, currentPage, totalPages, pageValue });

    const params = new URLSearchParams(searchParams);
    params.set("page", pageValue.toString());
    router.push(`${pathname}?${params.toString()}`);
  }
  return (
    <div className="flex gap-2 items-center justify-center">
      <Button
        size="lg"
        variant="outline"
        className="w-28"
        disabled={Number(currentPage) <= 1}
        onClick={() => handleClick("prev")}
      >
        <ArrowLeft />
        <span>Previous</span>
      </Button>
      Page {currentPage} of {totalPages}
      <Button
        size="lg"
        variant="outline"
        className="w-28"
        disabled={Number(currentPage) >= totalPages}
        onClick={() => handleClick("next")}
      >
        <span>Next</span>
        <ArrowRight />
      </Button>
    </div>
  );
}
