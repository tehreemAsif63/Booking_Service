import { unbookEmergencySlot } from "../controllers/emergencySlots-controller";
import { MessageException } from "../exceptions/MessageException";
import EmergencySlotSchema from "../schemas/emergencySlots";

jest.mock("../schemas/emergencySlots");

describe("unbookEmergencySlot", () => {
  it("should throw slot not found for update", async () => {
    const mockSlotId = "000000";
    const mockSlot = {
      emergencySlot_id: mockSlotId,
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

    const findByIdMock = jest.spyOn(EmergencySlotSchema, "findById");
    findByIdMock.mockResolvedValue(null);

    await expect(unbookEmergencySlot(mockSlot, requestInfo)).rejects.toThrow(
      new MessageException({
        code: 404,
        message: "Emergency slot not found for update",
      })
    );

    findByIdMock.mockRestore();
  });
});
