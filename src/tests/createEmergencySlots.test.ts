import { createEmergencySlot } from "../controllers/emergencySlots-controller";
import { MessageException } from "../exceptions/MessageException";
import EmergencySlotSchema from "../schemas/emergencySlots";

jest.mock("../schemas/emergencySlots");

describe("createEmergencySlot", () => {
  it("should throw Forbidden exception if user is not a dentist", async () => {
    const date = { date: new Date() };
    const requestInfo = {
      user: {
        id: "someUserId",
        email: "user@example.com",
        userType: "notDentist",
        admin: true,
        clinic_id: "000000",
      },
      requestID: "someRequestId",
    };

    await expect(createEmergencySlot(date, requestInfo)).rejects.toThrow(
      new MessageException({
        code: 403,
        message: "Forbidden",
      })
    );
  });

  it("should throw To be able to create a emergency slot, you have to be assigned to a clinic", async () => {
    const date = { date: new Date() };
    const requestInfo = {
      user: {
        id: "someUserId",
        email: "user@example.com",
        userType: "dentist",
        admin: true,
      },
      requestID: "someRequestId",
    };

    await expect(createEmergencySlot(date, requestInfo)).rejects.toThrow(
      new MessageException({
        code: 403,
        message:
          "To be able to create a emergency slot, you have to be assigned to a clinic",
      })
    );
  });

  it("should throw Emergency slot already exists for that time", async () => {
    const mockSlotDate = { date: new Date() };
    const mockSlot = { date: mockSlotDate };

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

    const findSpy = jest.spyOn(EmergencySlotSchema, "find");
    findSpy.mockResolvedValue([{ existingSlot: "slot data" }]);

    await expect(
      createEmergencySlot(mockSlotDate, requestInfo)
    ).rejects.toThrow(
      new MessageException({
        code: 403,
        message: "Emergency slot already exists for that time",
      })
    );

    findSpy.mockRestore();
  });
});
