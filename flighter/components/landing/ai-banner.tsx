import { Alert, AlertTitle } from "@/components/ui/alert";
import { IconSparkles2 } from "@tabler/icons-react";
import { Button } from "../ui/button";

export const AIBanner = () => {
  return (
    <>
      <Alert className="max-w-md md:max-w-xl mx-auto border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-50">
        <IconSparkles2 />
        <AlertTitle>Use AI to find the best destination for you</AlertTitle>
        <div className="mt-2 w-full">
          <p>
            We have integrated AI to help you discover personalized travel
            destinations based on your preferences. Try it out now!
          </p>
          <Button size="sm" variant="outline" className="mt-4 w-1/3">
            Enable
          </Button>
        </div>
      </Alert>
    </>
  );
};
