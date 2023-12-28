import { bookSlot } from "../controllers/slots-controller";
import { MessageException } from "../exceptions/MessageException";
import SlotSchema from "../schemas/slots";

jest.mock("../schemas/slots");

describe("bookSlot", () => {
  it("should throw slot not found for update", async () => {
    const mockSlotId = "000000";
    const mockSlot = {
      slot_id: mockSlotId,
      patient_id: "examplePatientId",
      description: "exampleDescription",
    };

    const requestInfo = {
      user: {
        id: "someUserId",
        email: "user@example.com",
        userType: "user",
        admin: false,
      },
      requestID: "someRequestID",
    };

    const findByIdMock = jest.spyOn(SlotSchema, "findByIdAndUpdate");
    findByIdMock.mockResolvedValue(null);

    await expect(bookSlot(mockSlot, requestInfo)).rejects.toThrow(
      new MessageException({
        code: 400,
        message: "Description and booking type needs to be specified",
      })
    );

    findByIdMock.mockRestore();
  });

  it("should throw Valid patient ID needs to be specified", async () => {
    const mockSlotId = "000000";
    const mockSlot = {
      slot_id: mockSlotId,
      description: "exampleDescription",
      booking_type: "exampleBookingType",
    };

    const requestInfo = {
      user: {
        id: "someUserId",
        email: "user@example.com",
        userType: "user",
        admin: false,
      },
      requestID: "someRequestID",
    };

    const findByIdMock = jest.spyOn(SlotSchema, "findByIdAndUpdate");
    findByIdMock.mockResolvedValue(mockSlot);

    await expect(bookSlot(mockSlot, requestInfo)).rejects.toThrow(
      new MessageException({
        code: 400,
        message: "Valid patient ID needs to be specified",
      })
    );

    findByIdMock.mockRestore();
  });
});
