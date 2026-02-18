import { render, screen, fireEvent } from "@testing-library/react";

import { FlightClassSelector } from "@/components/landing/flight-class-selector";

test("renders flight class selector and changes value", async () => {
  const onChange = jest.fn();

  render(<FlightClassSelector value="economy" onChange={onChange} />);

  const trigger = screen.getByTestId("flight-class-trigger");
  expect(screen.getByTestId("flight-class-value")).toHaveTextContent("economy");

  fireEvent.keyDown(trigger, { key: "Enter", code: "Enter", charCode: 13 });

  const businessOption = await screen.findByTestId("flight-class-business");
  const firstClassOption = await screen.findByTestId(
    "flight-class-first-class",
  );

  expect(businessOption).toBeInTheDocument();
  expect(firstClassOption).toBeInTheDocument();

  fireEvent.click(businessOption);

  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith("business");
});
