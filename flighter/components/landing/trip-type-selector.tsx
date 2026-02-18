"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import {
  IconArrowsLeftRight,
  IconArrowRight,
  IconChevronDown,
} from "@tabler/icons-react";
import { Dispatch, SetStateAction } from "react";

export const TripTypeSelector = ({
  value,
  onChange,
}: {
  value: string;
  onChange: Dispatch<SetStateAction<"round-trip" | "one-way">>;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          data-testid="trip-type-trigger"
          onClick={() => {
            console.log("clicked");
          }}
          className="pl-0"
        >
          {value === "round-trip" ? (
            <IconArrowsLeftRight data-testid="trip-type-icon-round-trip" />
          ) : (
            <IconArrowRight data-testid="trip-type-icon-one-way" />
          )}
          <span className="capitalize">{value}</span>
          <IconChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem
            data-testid="trip-type-round-trip"
            onClick={() => onChange("round-trip")}
          >
            <IconArrowsLeftRight data-testid="trip-type-option-icon-round-trip" />
            Round Trip
          </DropdownMenuItem>
          <DropdownMenuItem
            data-testid="trip-type-one-way"
            onClick={() => onChange("one-way")}
          >
            <IconArrowRight data-testid="trip-type-option-icon-one-way" />
            One Way
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
