import { deleteAllEmergencySlots } from "../controllers/emergencySlots-controller";
import { MessageException } from "../exceptions/MessageException";
import EmergencySlotSchema from "../schemas/emergencySlots";

jest.mock("../schemas/emergencySlots");

describe("deleteAllEmergencySlots", () => {
  it("should throw Forbidden", async () => {
    const mockSlotId = "000000";
    const mockSlot = {
      emergencySlot_id: mockSlotId,
    };

    const requestInfo = {
      user: {
        id: "someUserId",
        email: "user@example.com",
        userType: "notDentist",
        admin: false,
      },
      requestID: "someRequestID",
    };

    await expect(
      deleteAllEmergencySlots(mockSlot, requestInfo)
    ).rejects.toThrow(
      new MessageException({
        code: 403,
        message: "Forbidden",
      })
    );
  });

  it("should throw Database already empty", async () => {
    const deleteManyMock = jest.spyOn(EmergencySlotSchema, "deleteMany");
    deleteManyMock.mockRejectedValue(new Error("Database already empty"));

    const requestInfo = {
      user: {
        id: "adminUserId",
        email: "admin@example.com",
        userType: "dentist",
        admin: true,
        clinic_id: "adminClinicId",
      },
      requestID: "adminRequestId",
    };

    await expect(deleteAllEmergencySlots({}, requestInfo)).rejects.toThrow(
      new MessageException({
        code: 400,
        message: "Database already empty",
      })
    );

    deleteManyMock.mockRestore();
  });
});
