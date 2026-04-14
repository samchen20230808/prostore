import ProductCard from "@/components/shared/product/product-card";
import { buttonVariants } from "@/components/ui/button";
import {
  getAllCategories,
  getAllProducts,
} from "@/lib/actions/product-actions";
import Link from "next/link";

const prices = [
  {
    name: "$1 to $50",
    value: "1-50",
  },
  {
    name: "$51 to $100",
    value: "51-100",
  },
  {
    name: "$101 to $200",
    value: "101-200",
  },
  {
    name: "$201 to $500",
    value: "201-500",
  },
  {
    name: "$501 to $1000",
    value: "501-1000",
  },
];

const ratings = [5, 4, 3, 2, 1];

const sortOrders = ["newest", "lowest", "highest", "rating"];

export async function generateMetadata({
  searchParams,
}: {
  params: Promise<{
    category: string;
    query: string;
    price: string;
    rating: string;
  }>;
}) {
  const {
    category = "all",
    query = "all",
    price = "all",
    rating = "all",
  } = await searchParams;

  let titleString = "";
  if (query !== "all") titleString += query;
  if (category !== "all" && category !== "")
    titleString += ` Category ${category}`;
  if (price !== "all") titleString += ` Price ${price}`;
  if (rating !== "all") titleString += ` Rating ${rating}`;

  console.log(titleString);
  return { title: `Search ${titleString || "Products"}` };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    category: string;
    query: string;
    price: string;
    rating: string;
    sort: string;
    page: string;
  }>;
}) {
  const {
    category = "all",
    query = "all",
    price = "all",
    rating = "all",
    sort = "newest",
    page = "1",
  } = await searchParams;
  // console.log({ category, query });

  function getFilterUrl({
    c,
    s,
    p,
    r,
    pg,
  }: {
    c?: string;
    s?: string;
    p?: string;
    r?: string;
    pg?: string;
  }) {
    const params = { query, category, price, rating, sort, page };
    if (c) params.category = c;
    if (p) params.price = p;
    if (s) params.sort = s;
    if (r) params.rating = r;
    if (pg) params.page = pg;
    return `/search?${new URLSearchParams(params).toString()}`;
  }
  // console.log("URL: ", getFilterUrl({ c: "test" }));
  const products = await getAllProducts({
    limit: 6,
    query,
    category,
    price,
    rating,
    sort,
    page: Number(page),
  });
  // console.log(products);
  const categories = await getAllCategories();

  return (
    <div className="grid md:grid-cols-5 md:gap-5">
      <div>
        {/* category links*/}
        <div className=" mb-2 mt-3">Department</div>
        <div>
          <ul className="space-y-1 text-sm">
            <li>
              <Link
                className={`${(category === "all" || category === "") && "font-bold  text-accent-foreground bg-accent"}`}
                href={getFilterUrl({ c: "all" })}
              >
                Any
              </Link>
            </li>
            {categories.map((x) => (
              <li key={x.category}>
                <Link
                  className={`${category === x.category && "font-bold text-accent-foreground bg-accent"}`}
                  href={getFilterUrl({ c: x.category })}
                >
                  {x.category}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* price links*/}
        <div className="mb-2 mt-8">Price</div>
        <div>
          <ul className="space-y-1 text-sm ">
            <li>
              <Link
                className={`${(price === "all" || price === "") && "font-bold  text-accent-foreground bg-accent"}`}
                href={getFilterUrl({ p: "all" })}
              >
                Any
              </Link>
            </li>
            {prices.map((x) => (
              <li key={x.name}>
                <Link
                  className={`${price === x.value && "font-bold text-accent-foreground bg-accent"}`}
                  href={getFilterUrl({ p: x.value })}
                >
                  {x.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* rating links*/}
        <div className="mb-2 mt-8">Customer Review</div>
        <div>
          <ul className="space-y-1 text-sm">
            <li>
              <Link
                className={`${(rating === "all" || rating === "") && "font-bold  text-accent-foreground bg-accent"}`}
                href={getFilterUrl({ r: "all" })}
              >
                Any
              </Link>
            </li>
            {ratings.map((x) => (
              <li key={x}>
                <Link
                  className={`${rating === x.toString() && "font-bold text-accent-foreground bg-accent"}`}
                  href={getFilterUrl({ r: x.toString() })}
                >
                  {`${x} stars & up`}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="md:col-span-4 space-y-4">
        <div className="flex-between  flex-col md:flex-row my-4">
          <div className="flex items-center">
            {query !== "all" && query !== "" && `Query: ` + query}
            {category !== "all" && category !== "" && ` Category: ` + category}
            {price !== "all" && ` Price: ` + price}
            {rating !== "all" && ` Rating: ` + rating + ` stars & up`}
            &nbsp;
            {(query !== "all" && query !== "") ||
            (category !== "all" && category !== "") ||
            price !== "all" ||
            rating !== "all" ? (
              <>
                <Link
                  href="/search"
                  className={buttonVariants({ variant: "link" })}
                >
                  Clear
                </Link>
              </>
            ) : null}
          </div>
          <div className="text-sm space-x-1">
            Sort by{" "}
            {sortOrders.map((x) => (
              <Link
                key={x}
                className={`${sort === x && "font-bold text-accent-foreground bg-accent"}`}
                href={getFilterUrl({ s: x })}
              >
                {x}{" "}
              </Link>
            ))}
          </div>
        </div>
        <div className="grid grid-cols1 gap-4 md:grid-cols-3">
          {products.data.length === 0 && (
            <p className="mt-3">No products found</p>
          )}
          {products.data.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
