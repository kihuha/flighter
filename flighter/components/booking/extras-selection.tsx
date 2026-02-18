"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  IconArmchair,
  IconToolsKitchen2,
  IconLuggage,
} from "@tabler/icons-react";
import { SelectedExtras } from "./booking-wrapper";

interface ExtrasSelectionProps {
  passengerCount: number;
  selectedExtras: SelectedExtras;
  onExtrasChange: (extras: SelectedExtras) => void;
}

const SEAT_OPTIONS = [
  {
    id: "standard",
    label: "Standard Seat Selection",
    price: 15,
    icon: IconArmchair,
  },
  {
    id: "extra-legroom",
    label: "Extra Legroom",
    price: 45,
    icon: IconArmchair,
  },
  { id: "preferred", label: "Preferred Seat", price: 25, icon: IconArmchair },
];

const MEAL_OPTIONS = [
  {
    id: "standard",
    label: "Standard Meal",
    price: 12,
    icon: IconToolsKitchen2,
  },
  {
    id: "premium",
    label: "Premium Meal Selection",
    price: 28,
    icon: IconToolsKitchen2,
  },
  {
    id: "special",
    label: "Special Dietary Meal",
    price: 18,
    icon: IconToolsKitchen2,
  },
];

const BAGGAGE_OPTIONS = [
  {
    id: "carry-on",
    label: "Additional Carry-On",
    price: 35,
    icon: IconLuggage,
  },
  { id: "checked-1", label: "1st Checked Bag", price: 50, icon: IconLuggage },
  { id: "checked-2", label: "2nd Checked Bag", price: 75, icon: IconLuggage },
  { id: "oversize", label: "Oversized Baggage", price: 150, icon: IconLuggage },
];

export const ExtrasSelection = ({
  passengerCount,
  selectedExtras,
  onExtrasChange,
}: ExtrasSelectionProps) => {
  const handleToggle = (
    category: keyof SelectedExtras,
    item: { id: string; label: string; price: number },
  ) => {
    const currentItems = selectedExtras[category];
    const exists = currentItems.some((i) => i.type === item.id);

    if (exists) {
      onExtrasChange({
        ...selectedExtras,
        [category]: currentItems.filter((i) => i.type !== item.id),
      });
    } else {
      onExtrasChange({
        ...selectedExtras,
        [category]: [
          ...currentItems,
          { type: item.id, price: item.price * passengerCount },
        ],
      });
    }
  };

  const isSelected = (category: keyof SelectedExtras, id: string) => {
    return selectedExtras[category].some((i) => i.type === id);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Customize Your Experience</h2>

      {/* Seats */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <IconArmchair className="h-5 w-5" />
              Seat Selection
            </CardTitle>
            <Badge variant="secondary">Optional</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Pre-select your preferred seating
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {SEAT_OPTIONS.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`seat-${option.id}`}
                  checked={isSelected("seats", option.id)}
                  onCheckedChange={() => handleToggle("seats", option)}
                />
                <Label
                  htmlFor={`seat-${option.id}`}
                  className="cursor-pointer font-normal"
                >
                  {option.label}
                </Label>
              </div>
              <div className="text-right">
                <p className="font-medium">${option.price * passengerCount}</p>
                <p className="text-xs text-muted-foreground">
                  ${option.price} × {passengerCount}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Meals */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <IconToolsKitchen2 className="h-5 w-5" />
              In-Flight Meals
            </CardTitle>
            <Badge variant="secondary">Optional</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Upgrade your dining experience
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {MEAL_OPTIONS.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`meal-${option.id}`}
                  checked={isSelected("meals", option.id)}
                  onCheckedChange={() => handleToggle("meals", option)}
                />
                <Label
                  htmlFor={`meal-${option.id}`}
                  className="cursor-pointer font-normal"
                >
                  {option.label}
                </Label>
              </div>
              <div className="text-right">
                <p className="font-medium">${option.price * passengerCount}</p>
                <p className="text-xs text-muted-foreground">
                  ${option.price} × {passengerCount}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Baggage */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <IconLuggage className="h-5 w-5" />
              Additional Baggage
            </CardTitle>
            <Badge variant="secondary">Optional</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Add extra luggage allowance
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {BAGGAGE_OPTIONS.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`baggage-${option.id}`}
                  checked={isSelected("baggage", option.id)}
                  onCheckedChange={() => handleToggle("baggage", option)}
                />
                <Label
                  htmlFor={`baggage-${option.id}`}
                  className="cursor-pointer font-normal"
                >
                  {option.label}
                </Label>
              </div>
              <div className="text-right">
                <p className="font-medium">${option.price * passengerCount}</p>
                <p className="text-xs text-muted-foreground">
                  ${option.price} × {passengerCount}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
