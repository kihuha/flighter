import { Button } from "../ui/button";
import { IconCircle, IconMapPin, IconPlane, IconX } from "@tabler/icons-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ButtonGroup } from "../ui/button-group";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { useSearchDestinationsWithDebounce } from "@/hooks/use-search-destinations-with-debounce";

export const DestinationInput = ({
  title,
  onSelect,
  selectedValue,
  excludedAirportId,
  searchQuery,
  onSearchQueryChange,
  isDialogOpen,
  onDialogOpenChange,
}: {
  title: string;
  selectedValue: string;
  onSelect?: (value: string, airportId: string) => void;
  excludedAirportId?: string;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  isDialogOpen: boolean;
  onDialogOpenChange: (isOpen: boolean) => void;
}) => {
  const { results, isLoading } = useSearchDestinationsWithDebounce(searchQuery);

  const items = searchQuery.length >= 2 ? results : [];

  return (
    <Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={`text-sm justify-start h-12 font-normal`}
          data-testid="destination-trigger"
        >
          <IconCircle className="size-2" />
          <span data-testid="destination-trigger-title">
            {selectedValue || title}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="w-screen h-screen max-w-none max-h-none rounded-none p-2 md:h-96 md:rounded-lg md:p-4"
        data-testid="destination-dialog-content"
      >
        <div>
          <DialogHeader className="sr-only">
            <DialogTitle>Destination search</DialogTitle>
            <DialogDescription>
              Search for cities and airports.
            </DialogDescription>
          </DialogHeader>
          <ButtonGroup className="w-full">
            <Input
              placeholder={title}
              className="w-full placeholder-shown:text-sm"
              data-testid="destination-input"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
            />
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                data-testid="destination-dialog-close"
              >
                <IconX />
              </Button>
            </DialogClose>
          </ButtonGroup>

          <div className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-gray-500">Loading destinations...</p>
              </div>
            ) : items.length === 0 && searchQuery.length >= 2 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-gray-500">No destinations found</p>
              </div>
            ) : (
              <Accordion
                type="multiple"
                className="max-w-lg"
                defaultValue={
                  items
                    .filter((it) => it.type === "city" && it.value)
                    .map((it) => it.value) || []
                }
              >
                {items.map((item, idx) => {
                  if (item.type === "city") {
                    return (
                      <AccordionItem
                        key={`${item.value ?? item.trigger ?? "city"}-${idx}`}
                        value={item.value}
                      >
                        <AccordionTrigger>
                          <div className="flex items-center">
                            <IconMapPin className="size-4 mr-2" />
                            {item.trigger}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {Array.isArray(item.content)
                            ? item.content.map((c, i) => (
                                <div
                                  key={`${c.value ?? "airport"}-${i}`}
                                  className={`flex items-center p-2 ${
                                    c.airportId === excludedAirportId
                                      ? "opacity-50 cursor-not-allowed"
                                      : "cursor-pointer hover:bg-gray-100"
                                  }`}
                                  onClick={() => {
                                    if (
                                      c.airportId &&
                                      c.airportId !== excludedAirportId
                                    ) {
                                      onSelect?.(c.value, c.airportId);
                                    }
                                  }}
                                >
                                  <IconPlane className="size-4 transform -rotate-90 mr-2" />
                                  {c.value}
                                </div>
                              ))
                            : null}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  }

                  return (
                    <div
                      key={`${item.value ?? "airport"}-${idx}`}
                      className={`flex items-center p-2 py-4 border-b ${
                        item.airportId === excludedAirportId
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        if (
                          item.airportId &&
                          item.airportId !== excludedAirportId
                        ) {
                          onSelect?.(item.value, item.airportId);
                        }
                      }}
                    >
                      <IconPlane className="size-4 transform -rotate-90 mr-2" />{" "}
                      {item.value}
                    </div>
                  );
                })}
              </Accordion>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
