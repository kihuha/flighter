import { render, screen, fireEvent } from "@testing-library/react";

import { PassengerSelector } from "@/components/landing/passenger-selector";

test("renders passenger selector and increments counts", async () => {
  const setPassengers = jest.fn();

  render(
    <PassengerSelector
      passengers={{ adults: 1, children: 0 }}
      setPassengers={setPassengers}
    />,
  );

  const trigger = screen.getByTestId("passenger-trigger");
  expect(screen.getByTestId("passenger-total-count")).toHaveTextContent("1");

  fireEvent.pointerDown(trigger, { pointerType: "mouse" });
  fireEvent.pointerUp(trigger, { pointerType: "mouse" });
  fireEvent.click(trigger);

  const adultsIncrement = await screen.findByTestId(
    "passenger-adults-increment",
  );
  const childrenIncrement = screen.getByTestId("passenger-children-increment");

  fireEvent.click(adultsIncrement);
  expect(setPassengers).toHaveBeenCalledWith({ adults: 2, children: 0 });

  fireEvent.click(childrenIncrement);
  expect(setPassengers).toHaveBeenCalledWith({ adults: 1, children: 1 });
});

test("does not decrement below minimums", async () => {
  const setPassengers = jest.fn();

  render(
    <PassengerSelector
      passengers={{ adults: 1, children: 0 }}
      setPassengers={setPassengers}
    />,
  );

  const trigger = screen.getByTestId("passenger-trigger");
  fireEvent.pointerDown(trigger, { pointerType: "mouse" });
  fireEvent.pointerUp(trigger, { pointerType: "mouse" });
  fireEvent.click(trigger);

  const adultsDecrement = await screen.findByTestId(
    "passenger-adults-decrement",
  );
  const childrenDecrement = screen.getByTestId("passenger-children-decrement");

  fireEvent.click(adultsDecrement);
  fireEvent.click(childrenDecrement);

  expect(setPassengers).not.toHaveBeenCalled();
});

test("decrements children when above zero", async () => {
  const setPassengers = jest.fn();

  render(
    <PassengerSelector
      passengers={{ adults: 2, children: 1 }}
      setPassengers={setPassengers}
    />,
  );

  const trigger = screen.getByTestId("passenger-trigger");
  fireEvent.pointerDown(trigger, { pointerType: "mouse" });
  fireEvent.pointerUp(trigger, { pointerType: "mouse" });
  fireEvent.click(trigger);

  const childrenDecrement = await screen.findByTestId(
    "passenger-children-decrement",
  );

  fireEvent.click(childrenDecrement);

  expect(setPassengers).toHaveBeenCalledWith({ adults: 2, children: 0 });
});
