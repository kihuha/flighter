import {
  IconChevronDown,
  IconMinus,
  IconPlus,
  IconUser,
} from "@tabler/icons-react";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../ui/popover";
import { ButtonGroup } from "../ui/button-group";
import { Label } from "../ui/label";

export const PassengerSelector = ({
  passengers: { adults, children },
  setPassengers,
}: {
  passengers: { adults: number; children: number };
  setPassengers: (passengers: { adults: number; children: number }) => void;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" data-testid="passenger-trigger">
          <IconUser data-testid="passenger-trigger-icon" />
          <span data-testid="passenger-total-count">{adults + children}</span>
          <IconChevronDown
            className="ml-1"
            data-testid="passenger-trigger-chevron"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle data-testid="passenger-popover-title">
            Travellers
          </PopoverTitle>
          <div className="mt-4 flex flex-col gap-y-4">
            <div className="grid grid-cols-2 items-center">
              <Label data-testid="passenger-adults-label">Adults</Label>
              <ButtonGroup>
                <Button
                  variant="outline"
                  data-testid="passenger-adults-decrement"
                  onClick={() => {
                    if (adults > 1) {
                      setPassengers({ adults: adults - 1, children });
                    }
                  }}
                >
                  <IconMinus data-testid="passenger-adults-decrement-icon" />
                </Button>
                <Button variant="outline" data-testid="passenger-adults-count">
                  {adults}
                </Button>
                <Button
                  variant="outline"
                  data-testid="passenger-adults-increment"
                  onClick={() => {
                    setPassengers({ adults: adults + 1, children });
                  }}
                >
                  <IconPlus data-testid="passenger-adults-increment-icon" />
                </Button>
              </ButtonGroup>
            </div>
            <div className="grid grid-cols-2 items-center">
              <Label data-testid="passenger-children-label">Children</Label>
              <ButtonGroup>
                <Button
                  variant="outline"
                  data-testid="passenger-children-decrement"
                  onClick={() => {
                    if (children > 0) {
                      setPassengers({ adults, children: children - 1 });
                    }
                  }}
                >
                  <IconMinus data-testid="passenger-children-decrement-icon" />
                </Button>
                <Button
                  variant="outline"
                  data-testid="passenger-children-count"
                >
                  {children}
                </Button>
                <Button
                  variant="outline"
                  data-testid="passenger-children-increment"
                  onClick={() => {
                    setPassengers({ adults, children: children + 1 });
                  }}
                >
                  <IconPlus data-testid="passenger-children-increment-icon" />
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  );
};
