import { getSlot } from "../controllers/slots-controller";
import { MessageException } from "../exceptions/MessageException";
import SlotSchema from "../schemas/slots";

jest.mock("../schemas/slots");

describe("getSlot", () => {
  it("should return the slot if found", async () => {
    const mockSlotId = "slotId";
    const mockSlot = {
      slot_id: mockSlotId,
    };

    const findByIdMock = jest.spyOn(SlotSchema, "findById");
    findByIdMock.mockResolvedValue(mockSlot);

    const data = { slot_id: "slotId" };
    const requestInfo = {
      user: {
        id: "someUserId",
        email: "user@example.com",
        userType: "dentist",
        admin: true,
        clinic_id: "000000",
      },
      requestID: "someRequestId",
    };

    const result = await getSlot(data, requestInfo);

    expect(result).toEqual(mockSlot);
    expect(findByIdMock).toHaveBeenCalledWith(mockSlotId);

    findByIdMock.mockRestore();
  });

  it("should throw Invalid slot ID", async () => {
    const mockSlotId = "slotId";
    const mockSlot = {
      slot_id: mockSlotId,
    };

    const requestInfo = {
      user: {
        id: "someUserId",
        email: "user@example.com",
        userType: "dentist",
        admin: true,
        clinic_id: "000000",
      },
      requestID: "someRequestId",
    };

    const findByIdMock = jest.spyOn(SlotSchema, "findById");
    findByIdMock.mockResolvedValue(null);

    await expect(getSlot(mockSlot, requestInfo)).rejects.toThrow(
      new MessageException({
        code: 400,
        message: "Invalid slot ID",
      })
    );

    findByIdMock.mockRestore();
  });
});
