import { describe, expect, it } from "vitest";

import { nextStatusTransition, type Fulfilment, type OrderStatus } from "./types";

function transitions(status: OrderStatus, fulfilment: Fulfilment) {
  return nextStatusTransition(status, fulfilment);
}

describe("nextStatusTransition — fulfilment-specific lifecycle", () => {
  it("delivery: confirmed → out_for_delivery", () => {
    expect(transitions("confirmed", "delivery")).toMatchObject({
      to: "out_for_delivery",
      label: "Mark out for delivery",
    });
  });

  it("delivery: out_for_delivery → completed", () => {
    expect(transitions("out_for_delivery", "delivery")).toMatchObject({
      to: "completed",
      label: "Mark completed",
    });
  });

  it("delivery never passes through ready_for_pickup", () => {
    expect(transitions("ready_for_pickup", "delivery")).toBeUndefined();
  });

  it("pickup: confirmed → ready_for_pickup", () => {
    expect(transitions("confirmed", "pickup")).toMatchObject({
      to: "ready_for_pickup",
      label: "Mark ready for pickup",
    });
  });

  it("pickup: ready_for_pickup → completed", () => {
    expect(transitions("ready_for_pickup", "pickup")).toMatchObject({
      to: "completed",
      label: "Mark completed",
    });
  });

  it("pickup never reaches out_for_delivery", () => {
    expect(transitions("out_for_delivery", "pickup")).toBeUndefined();
  });

  it("terminal states offer no transition", () => {
    expect(transitions("completed", "pickup")).toBeUndefined();
    expect(transitions("completed", "delivery")).toBeUndefined();
    expect(transitions("cancelled", "pickup")).toBeUndefined();
    expect(transitions("cancelled", "delivery")).toBeUndefined();
  });
});
