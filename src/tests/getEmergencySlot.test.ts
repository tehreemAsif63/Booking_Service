import { getEmergencySlot } from "../controllers/emergencySlots-controller";
import { MessageException } from "../exceptions/MessageException";
import EmergencySlot from "../schemas/emergencySlots";

jest.mock("../schemas/slots");

describe("getEmergencySlot", () => {
  it("should return the slot if found", async () => {
    const mockSlotId = "slotId";
    const mockSlot = {
      emergencySlot_id: mockSlotId,
    };

    const findByIdMock = jest.spyOn(EmergencySlot, "findById");
    findByIdMock.mockResolvedValue(mockSlot);

    const data = { emergencySlot_id: "slotId" };
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

    const result = await getEmergencySlot(data, requestInfo);

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

    const findByIdMock = jest.spyOn(EmergencySlot, "findById");
    findByIdMock.mockResolvedValue(null);

    await expect(getEmergencySlot(mockSlot, requestInfo)).rejects.toThrow(
      new MessageException({
        code: 400,
        message: "Invalid emergency slot ID",
      })
    );

    findByIdMock.mockRestore();
  });
});
