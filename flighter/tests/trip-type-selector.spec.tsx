import { TripTypeSelector } from "@/components/landing/trip-type-selector";

import { render, screen, fireEvent } from "@testing-library/react";

test("Should render TripTypeSelector correctly", async () => {
  render(<TripTypeSelector value={""} onChange={jest.fn()} />);
  const trigger = screen.getByTestId("trip-type-trigger");
  expect(trigger).toBeInTheDocument();

  // Open the dropdown menu via keyboard to avoid PointerEvent issues in jsdom
  fireEvent.keyDown(trigger, { key: "Enter", code: "Enter", charCode: 13 });

  const roundTripOption = await screen.findByTestId("trip-type-round-trip");
  const oneWayOption = await screen.findByTestId("trip-type-one-way");

  expect(roundTripOption).toBeInTheDocument();
  expect(oneWayOption).toBeInTheDocument();
});
