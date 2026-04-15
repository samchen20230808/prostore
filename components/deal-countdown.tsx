"use client";

import Link from "next/link";
import { buttonVariants } from "./ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";

function StarBox({ label, value }: { label: string; value: number }) {
  return (
    <li className="p-4 w-full text-center">
      <p className="text-3xl font-bold">{value}</p>
      <p>{label}</p>
    </li>
  );
}

const TARGET_DATE = new Date("2026-04-17T00:00:00");
// console.log({ TARGET_DATE });

function calculateTimeRemaining(targetDate: Date) {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  // console.log({ now, diff });
  return {
    days: Math.max(Math.floor(diff / (1000 * 60 * 60 * 24)), 0),
    hours: Math.max(Math.floor((diff / (1000 * 60 * 60)) % 24), 0),
    minutes: Math.max(Math.floor((diff / (1000 * 60)) % 60), 0),
    seconds: Math.max(Math.floor((diff / 1000) % 60), 0),
  };
}

export default function DealCountDown() {
  const [remainingTime, setRemainingTime] =
    useState<ReturnType<typeof calculateTimeRemaining>>();

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setRemainingTime(calculateTimeRemaining(TARGET_DATE));
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);
  // console.log({ remainingTime });
  if (!remainingTime) return null;
  if (
    remainingTime.days === 0 &&
    remainingTime.hours === 0 &&
    remainingTime.minutes === 0 &&
    remainingTime.seconds === 0
  ) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 my-20">
        <div className="flex flex-col gap-2 justify-center">
          <h3 className="text-3xl font-bold">Deal has ended</h3>
          <p>
            This deal is no longer available. Check out our latest promotions!
          </p>
          <div className="text-center">
            <Link
              href="/search"
              className={buttonVariants({ variant: "default" })}
            >
              View Products
            </Link>
          </div>
        </div>
        <div className="flex justify-center">
          <Image
            src="/images/promo.jpg"
            alt="promo image"
            width={300}
            height={200}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 my-20">
      <div className="flex flex-col gap-2 justify-center">
        <h3 className="text-3xl font-bold">Deal of The Month</h3>
        <p>
          Get ready for a shopping experience like never before with our Deals
          of the Month! Every purchase comes with exclusive perks and offers,
          making this month a celebration of savvy choices and amazing deals.
          Don&apos;t miss out! 🎁🛒
        </p>
        <ul className="grid grid-cols-4">
          <StarBox label="Days" value={remainingTime.days} />
          <StarBox label="Hours" value={remainingTime.hours} />
          <StarBox label="Minutes" value={remainingTime.minutes} />
          <StarBox label="Seconds" value={remainingTime.seconds} />
        </ul>
        <div className="text-center">
          <Link
            href="/search"
            className={buttonVariants({ variant: "default" })}
          >
            View Products
          </Link>
        </div>
      </div>
      <div className="flex justify-center">
        <Image
          src="/images/promo.jpg"
          alt="promo image"
          width={300}
          height={200}
        />
      </div>
    </section>
  );
}
