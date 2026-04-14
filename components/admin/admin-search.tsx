"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Input } from "../ui/input";

export default function AdminSearch() {
  const pathname = usePathname();
  const formActionUrl = pathname.includes("/admin/orders")
    ? "/admin/orders"
    : pathname.includes("/admin/users")
      ? "/admin/users"
      : "/admin/products";
  const searchParams = useSearchParams();

  const queryValue = useMemo(
    () => searchParams.get("query") || "",
    [searchParams],
  );

  return (
    <form method="GET" action={formActionUrl}>
      <Input
        type="search"
        placeholder="Search..."
        name="query"
        key={`${pathname}-${searchParams.get("query")}`}
        defaultValue={queryValue ?? ""}
        className="md:w-[100px] lg:w-[300px]"
      />
      <button type="submit" className="sr-only" />
    </form>
  );
}
