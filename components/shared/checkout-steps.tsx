import { cn } from "@/lib/utils";
import React from "react";

export default function CheckoutSteps({ current = 0 }) {
  return (
    <div className="flex-between flex-col md:flex-row  mb-10 items-center ">
      {["User Login", "Shipping Address", "Payment Method", "Place Order"].map(
        (step, index) => (
          <React.Fragment key={index}>
            <div
              className={cn(
                "p-2 w-46 rounded-full text-center text-sm",
                index === current && "bg-secondary",
              )}
            >
              {step}
            </div>
            {step !== "Place Order" && (
              <hr className="w-16 border-t border-gray-300 mx-2" />
            )}
          </React.Fragment>
        ),
      )}
    </div>
  );
}
