import { checkAdminAccess } from "../controllers/clinics-controller";
import { MessageException } from "../exceptions/MessageException";
import ClinicSchema from "../schemas/clinics";

jest.mock("../schemas/clinics");

describe("checkAdminAccess", () => {
  it("should return Forbidden. Only admins can perform this action.", async () => {
    const requestInfo = {
      notAdmin: {
        id: "notAdmin",
        email: "not@admin.com",
        userType: "notAdmin",
        admin: false,
        clinic_id: "notAdmin",
        dentist_id: "notAdmin",
      },
      requestID: "notAdmin",
    };

    await expect(checkAdminAccess(requestInfo)).rejects.toThrow(
      new MessageException({
        code: 403,
        message: "Forbidden. Only admins can perform this action",
      })
    );
  });
});
