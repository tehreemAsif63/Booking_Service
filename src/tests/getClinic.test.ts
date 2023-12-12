import { getClinic } from "../controllers/clinics-controller";
import { MessageException } from "../exceptions/MessageException";
import ClinicSchema from "../schemas/clinics";

jest.mock("../schemas/clinics");

describe("getClinic", () => {
  it("should return Not found. Clinic does not exist.", async () => {
    const exampleClinic = { clinic_id: "exampleId" };

    const findByIdSpy = jest.spyOn(ClinicSchema, "findById");
    findByIdSpy.mockResolvedValue(exampleClinic);

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

    const result = await getClinic({ clinic_id: "exampleId" }, requestInfo);

    expect(result).toEqual({ clinic: exampleClinic });

    findByIdSpy.mockClear();
  });

  it("should return Not found. Clinic does not exists.", async () => {
    const exampleClinicId = { clinic_id: "exampleId" };

    const findByIdSpy = jest.spyOn(ClinicSchema, "findById");
    findByIdSpy.mockResolvedValue(null);

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

    await expect(getClinic(exampleClinicId, requestInfo)).rejects.toThrow(
      new MessageException({
        code: 404,
        message: "Not found. Clinic does not exists.",
      })
    );

    findByIdSpy.mockRestore();
  });
});
