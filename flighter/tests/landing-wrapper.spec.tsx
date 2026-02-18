import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";

import { LandingWrapper } from "@/components/landing/landing-wrapper";
import { useSearchDestinationsWithDebounce } from "@/hooks/use-search-destinations-with-debounce";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: ComponentProps<"img">) => <img alt="" {...props} />,
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("@/hooks/use-search-destinations-with-debounce", () => ({
  useSearchDestinationsWithDebounce: jest.fn(),
}));

jest.mock("@/components/landing/cheap-flights-section", () => ({
  CheapFlightsSection: () => <div data-testid="cheap-flights-section" />,
}));

jest.mock("@/components/landing/popular-flights-section", () => ({
  PopularFlightsSection: () => <div data-testid="popular-flights-section" />,
}));

jest.mock("@/components/landing/ai-banner", () => ({
  AIBanner: () => <div data-testid="ai-banner" />,
}));

jest.mock("@/components/landing/faq", () => ({
  FAQ: () => <div data-testid="faq" />,
}));

const mockUseSearchDestinationsWithDebounce =
  useSearchDestinationsWithDebounce as jest.Mock;

afterEach(() => {
  mockUseSearchDestinationsWithDebounce.mockReset();
});

test("renders landing wrapper controls", () => {
  mockUseSearchDestinationsWithDebounce.mockReturnValue({
    results: [],
    isLoading: false,
    isFetching: false,
    error: null,
  });

  render(<LandingWrapper />);

  expect(screen.getByTestId("landing-wrapper")).toBeInTheDocument();
  expect(screen.getByTestId("trip-type-trigger")).toBeInTheDocument();
  expect(screen.getByTestId("passenger-trigger")).toBeInTheDocument();
  expect(screen.getByTestId("flight-class-trigger")).toBeInTheDocument();

  const destinationTriggers = screen.getAllByTestId("destination-trigger");
  expect(destinationTriggers).toHaveLength(4);

  expect(screen.getByTestId("date-range-from")).toHaveTextContent("Date");
  expect(screen.getByTestId("date-range-to")).toHaveTextContent("Return");
});
