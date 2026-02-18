import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "../ui/item";
import { Button } from "../ui/button";
import { IconArrowRight } from "@tabler/icons-react";

export const CheapFlightsSection = () => {
  const highlights = [
    {
      from: "Nairobi",
      to: [
        {
          destination: "Kisumu",
          price: "KES 19,201",
        },
        {
          destination: "Mombasa",
          price: "KES 15,450",
        },
      ],
    },
    {
      from: "Mombasa",
      to: [
        {
          destination: "Nairobi",
          price: "KES 18,300",
        },
        {
          destination: "Kisumu",
          price: "KES 20,150",
        },
      ],
    },
    {
      from: "Kisumu",
      to: [
        {
          destination: "Nairobi",
          price: "KES 17,800",
        },
        {
          destination: "Mombasa",
          price: "KES 16,900",
        },
      ],
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Find Cheap Flights from Kenya to anywhere
      </h2>

      <Tabs defaultValue="nairobi" className="w-100 mx-auto md:w-auto">
        <TabsList>
          {highlights.map((highlight) => (
            <TabsTrigger
              key={highlight.from}
              value={highlight.from.toLowerCase()}
            >
              {highlight.from}
            </TabsTrigger>
          ))}
        </TabsList>
        {highlights.map((highlight) => (
          <TabsContent
            key={highlight.from}
            value={highlight.from.toLowerCase()}
            className="flex flex-col gap-y-2 md:flex-row md:gap-x-4"
          >
            {highlight.to.map((dest) => (
              <Item
                key={dest.destination}
                variant="outline"
                className="md:w-full md:flex-1"
              >
                <ItemContent>
                  <ItemTitle>
                    {highlight.from}
                    <IconArrowRight className="inline-block size-4" />
                    {dest.destination}
                  </ItemTitle>
                  <ItemDescription>Apr 20 - Mar 6</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button variant="ghost" size="sm">
                    <span>From {dest.price}</span>
                    <IconArrowRight className="inline-block ml-2 size-4" />
                  </Button>
                </ItemActions>
              </Item>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
