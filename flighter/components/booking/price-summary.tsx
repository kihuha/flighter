"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

interface PriceSummaryProps {
  basePrice: number;
  extrasTotal: number;
  taxesAndFees: number;
  totalPrice: number;
  currency: string;
}

export const PriceSummary = ({
  basePrice,
  extrasTotal,
  taxesAndFees,
  totalPrice,
  currency,
}: PriceSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Price Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Flight(s)</span>
          <span className="font-medium">
            {currency} ${basePrice.toLocaleString()}
          </span>
        </div>

        {extrasTotal > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Extras</span>
            <span className="font-medium">
              {currency} ${extrasTotal.toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Taxes & Fees</span>
          <span className="font-medium">
            {currency} ${taxesAndFees.toLocaleString()}
          </span>
        </div>

        <Separator />

        <div className="flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="text-xl font-bold">
            {currency} ${totalPrice.toLocaleString()}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          All prices include applicable taxes and fees
        </p>
      </CardContent>
    </Card>
  );
};
