"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { IconChevronDown } from "@tabler/icons-react";
import { Dispatch, SetStateAction } from "react";

export const FlightClassSelector = ({
  value,
  onChange,
}: {
  value: string;
  onChange: Dispatch<SetStateAction<"economy" | "business" | "first-class">>;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          data-testid="flight-class-trigger"
          onClick={() => {
            console.log("clicked");
          }}
          className="w-25 pr-0 flex items-center justify-between"
        >
          <span className="capitalize text-sm" data-testid="flight-class-value">
            {value}
          </span>
          <IconChevronDown data-testid="flight-class-chevron" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem
            data-testid="flight-class-economy"
            onClick={() => onChange("economy")}
          >
            Economy
          </DropdownMenuItem>
          <DropdownMenuItem
            data-testid="flight-class-business"
            onClick={() => onChange("business")}
          >
            Business
          </DropdownMenuItem>
          <DropdownMenuItem
            data-testid="flight-class-first-class"
            onClick={() => onChange("first-class")}
          >
            First Class
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
