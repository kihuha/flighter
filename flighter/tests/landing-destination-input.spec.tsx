import { render, screen } from "@testing-library/react";

import { DestinationInput } from "@/components/landing/destination-input";
import { useSearchDestinationsWithDebounce } from "@/hooks/use-search-destinations-with-debounce";

jest.mock("@/hooks/use-search-destinations-with-debounce", () => ({
  useSearchDestinationsWithDebounce: jest.fn(),
}));

const mockUseSearchDestinationsWithDebounce =
  useSearchDestinationsWithDebounce as jest.Mock;

afterEach(() => {
  mockUseSearchDestinationsWithDebounce.mockReset();
});

test("renders destination trigger closed by default", () => {
  mockUseSearchDestinationsWithDebounce.mockReturnValue({
    results: [],
    isLoading: false,
    isFetching: false,
    error: null,
  });

  render(
    <DestinationInput
      title="From"
      selectedValue=""
      onSelect={jest.fn()}
      excludedAirportId={undefined}
      searchQuery=""
      onSearchQueryChange={jest.fn()}
      isDialogOpen={false}
      onDialogOpenChange={jest.fn()}
    />,
  );

  expect(screen.getByTestId("destination-trigger")).toBeInTheDocument();
  expect(screen.queryByTestId("destination-dialog-content")).toBeNull();
});

test("renders destination dialog content when open", async () => {
  mockUseSearchDestinationsWithDebounce.mockReturnValue({
    results: [],
    isLoading: false,
    isFetching: false,
    error: null,
  });

  render(
    <DestinationInput
      title="Where To"
      selectedValue=""
      onSelect={jest.fn()}
      excludedAirportId={undefined}
      searchQuery=""
      onSearchQueryChange={jest.fn()}
      isDialogOpen
      onDialogOpenChange={jest.fn()}
    />,
  );

  const dialog = await screen.findByTestId("destination-dialog-content");
  expect(dialog).toBeInTheDocument();
  expect(screen.getByTestId("destination-input")).toBeInTheDocument();
  expect(screen.getByTestId("destination-dialog-close")).toBeInTheDocument();
});
