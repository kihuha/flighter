"use client";

import { Button } from "@/components/ui/button";
import { IconArrowRight, IconMenu } from "@tabler/icons-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ManageBookingDialog } from "@/components/manage-booking-dialog";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

export const Header = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <header className="flex items-center justify-between py-2 px-4 max-w-7xl mx-auto">
      <h2 className="font-bold">Flighter</h2>

      {isMobile ? (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="ghost">
              <IconMenu />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Flighter</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-y-4 px-2 w-full">
              <Button
                variant="ghost"
                className="text-primary w-full justify-start"
              >
                <div className="leading-none font-medium">Home</div>
                <IconArrowRight className="ml-auto" />
              </Button>
              <ManageBookingDialog
                trigger={
                  <Button
                    variant="ghost"
                    className="text-primary w-full justify-start"
                  >
                    <div className="leading-none font-medium">
                      Manage Booking
                    </div>
                    <IconArrowRight className="ml-auto" />
                  </Button>
                }
                setIsSheetOpen={setIsSheetOpen}
              />
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <NavigationMenu>
          <NavigationMenuList className="gap-x-6">
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Button variant="ghost">Home</Button>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <ManageBookingDialog
                  trigger={
                    <Button variant="link">
                      <div className="leading-none font-medium">
                        Manage Booking
                      </div>
                    </Button>
                  }
                  setIsSheetOpen={setIsSheetOpen}
                />
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )}
    </header>
  );
};
