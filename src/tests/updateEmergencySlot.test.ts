import { updateEmergencySlot } from "../controllers/emergencySlots-controller";
import { MessageException } from "../exceptions/MessageException";
import EmergencySlotSchema from "../schemas/emergencySlots";

jest.mock("../schemas/emergencySlots");

describe("updateEmergencySlot", () => {
  it("should return Forbidden. Only admins can perform this action.", async () => {
    const data = { emergencySlot_id: "slotId" };
    const requestInfo = {
      user: {
        id: "someUserId",
        email: "user@example.com",
        userType: "notdentist",
        admin: true,
        clinic_id: "000000",
      },
      requestID: "someRequestId",
    };

    await expect(updateEmergencySlot(data, requestInfo)).rejects.toThrow(
      new MessageException({
        code: 403,
        message: "Forbidden. Only dentists can perform this action.",
      })
    );
  });

  it("should return slot not found", async () => {
    const mockSlotId = { emergencySlot_id: "slotId" };
    const mockSlot = { emergencySlot_id: mockSlotId };

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

    const findByIdMock = jest.spyOn(EmergencySlotSchema, "findById");
    findByIdMock.mockResolvedValue(null);

    await expect(updateEmergencySlot(mockSlot, requestInfo)).rejects.toThrow(
      new MessageException({
        code: 400,
        message: "Emergency slot not found",
      })
    );

    findByIdMock.mockRestore();
  });

  it("should return Failed to update slot", async () => {
    const updateInfo = {
      emergencySlot_id: "123456",
      date: new Date(),
      dentistId: "000000",
      clinic_id: "000000",
    };
    const existingSlotId = { emergencySlot_id: "123456" };
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

    const findByIdSpy = jest.spyOn(EmergencySlotSchema, "findById");
    findByIdSpy.mockResolvedValue([{ existingSlot: existingSlotId }]);

    await expect(updateEmergencySlot(updateInfo, requestInfo)).rejects.toThrow(
      new MessageException({
        code: 500,
        message: "Failed to update Emergency slot",
      })
    );

    findByIdSpy.mockRestore();
  });
});
