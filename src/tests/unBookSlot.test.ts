import { unBookSlot } from "../controllers/slots-controller";
import { MessageException } from "../exceptions/MessageException";
import SlotSchema from "../schemas/slots";

jest.mock("../schemas/slots");

describe("unbookSlot", () => {
  it("should throw slot not found for update", async () => {
    const mockSlotId = "000000";
    const mockSlot = {
      slot_id: mockSlotId,
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

    const findByIdMock = jest.spyOn(SlotSchema, "findById");
    findByIdMock.mockResolvedValue(null);

    await expect(unBookSlot(mockSlot, requestInfo)).rejects.toThrow(
      new MessageException({
        code: 404,
        message: "Slot not found for update",
      })
    );

    findByIdMock.mockRestore();
  });
});
