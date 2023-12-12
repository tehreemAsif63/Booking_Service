import EmergencySlotSchema from "../schemas/emergencySlots";
import clinicSchema, { Clinic } from "../schemas/clinics";
import { MessageException } from "../exceptions/MessageException";
import {
  MessageHandler,
  MessageData,
  RequestInfo,
} from "../utilities/types-utils";

export const createEmergencySlot: MessageHandler = async (
  data,
  requestInfo
) => {
  if (requestInfo.user?.userType !== "dentist") {
    throw new MessageException({
      code: 403,
      message: "Forbidden",
    });
  }

  if (!requestInfo.user?.clinic_id) {
    throw new MessageException({
      code: 403,
      message:
        "To be able to create a emergency slot, you have to be assigned to a clinic",
    });
  }

  const { date } = data;

  // validate the data of the slot
  if (!date) {
    // throw
    throw new MessageException({
      code: 403,
      message: "Input missing data, All data required",
    });
  }

  const clinic_id = requestInfo.user.clinic_id;
  const dentist_id = requestInfo.user.id;

  // find a registered emergency slot in DB
  const registeredSlot = EmergencySlotSchema.find({
    date,
    clinic_id,
    dentist_id,
  });

  // check if slot already registered in DB
  if ((await registeredSlot).length > 0) {
    throw new MessageException({
      code: 403,
      message: "Emergency slot already exists for that time",
    });
  }

  const emergencySlot = new EmergencySlotSchema({
    date,
    booked: false,
    dentist_id,
    clinic_id,
  });

  emergencySlot.save();

  return emergencySlot;
};

export const getEmergencySlot: MessageHandler = async (data, requestInfo) => {
  const { emergencySlot_id } = data;
  const emergencySlot = await EmergencySlotSchema.findById(emergencySlot_id);

  if (!emergencySlot) {
    throw new MessageException({
      code: 400,
      message: "Invalid emergency slot ID",
    });
  }

  if (emergencySlot === null) {
    throw new MessageException({
      code: 400,
      message: "Emergency slot does not exist",
    });
  }

  return emergencySlot;
};

//Get all slots
export const getEmergencySlots: MessageHandler = async () => {
  const emergencySlots = await EmergencySlotSchema.find();

  if (!emergencySlots || emergencySlots.length === 0) {
    throw new MessageException({
      code: 404,
      message: "No emergency slots found",
    });
  }

  return emergencySlots;
};

// updateSlot fields -PATCH
export const updateEmergencySlot: MessageHandler = async (
  data,
  requestInfo
) => {
  if (requestInfo.user?.userType !== "dentist") {
    throw new MessageException({
      code: 403,
      message: "Forbidden. Only dentists can perform this action.",
    });
  }
  const { EmergencySlot_id, date, dentistId, clinic_id } = data;
  console.log("EmergencySlotID", EmergencySlot_id);
  // Check if the slot with the given ID exists
  const existingEmergencySlot = await EmergencySlotSchema.findById(
    EmergencySlot_id
  );
  if (!existingEmergencySlot) {
    throw new MessageException({
      code: 400,
      message: "Emergency slot not found",
    });
  }

  // Check if slotUpdates that's provided and not empty
  if (!date || !dentistId || !clinic_id) {
    throw new MessageException({
      code: 422,
      message:
        "Input missing data, All input fields are required to be filled.",
    });
  }

  // Perform the partial update
  const updatedEmergencySlot = await EmergencySlotSchema.findByIdAndUpdate(
    EmergencySlot_id,
    { date, dentistId, clinic_id },
    { new: true, runValidators: true }
  );

  if (!updatedEmergencySlot) {
    throw new MessageException({
      code: 500,
      message: "Failed to update Emergency slot",
    });
  }

  return updatedEmergencySlot;
};

// delete slot with a specific ID
export const deleteEmergencySlot: MessageHandler = async (data) => {
  const { emergencySlot_id } = data;

  const emergencySlot = await EmergencySlotSchema.findByIdAndDelete(
    emergencySlot_id
  );

  if (!emergencySlot) {
    throw new MessageException({
      code: 400,
      message: "Invalid id",
    });
  }

  if (emergencySlot === null) {
    throw new MessageException({
      code: 400,
      message: "Emergency slot does not exist",
    });
  }
  return "Emergency slot deleted";
};

/*
  It should be bookSlot
  and another one to UnbookSlot
  */
export const bookEmergencySlot: MessageHandler = async (data) => {
  var { EmergencySlot_id, booked, user_id } = data;
  booked = true;
  const EmergencySlot = await EmergencySlotSchema.findByIdAndUpdate(
    EmergencySlot_id,
    { booked, user_id: user_id },
    { new: true }
  );

  if (!EmergencySlot) {
    throw new MessageException({
      code: 404,
      message: "Emergency slot not found for update",
    });
  }
  return EmergencySlot;
};

export const unbookEmergencySlot: MessageHandler = async (data) => {
  var { EmergencySlot_id, booked, user_id } = data;
  booked = false;
  const EmergencySlot = await EmergencySlotSchema.findByIdAndUpdate(
    EmergencySlot_id,
    { booked, user_id: "Not Registered" },
    { new: true }
  );

  if (!EmergencySlot) {
    throw new MessageException({
      code: 404,
      message: "Emergency slot not found for update",
    });
  }
  return EmergencySlot;
};

export const deleteAllEmergencySlots: MessageHandler = async (
  data,
  requestInfo
) => {
  if (requestInfo.user?.userType !== "dentist") {
    throw new MessageException({
      code: 403,
      message: "Forbidden",
    });
  }

  if (EmergencySlotSchema.length >= 1) {
    await EmergencySlotSchema.deleteMany(data);
    return "All emergency slots deleted";
  } else {
    throw new MessageException({
      code: 400,
      message: "Database already empty",
    });
  }
};

export default {
  createEmergencySlot,
  getEmergencySlot,
  getEmergencySlots,
  updateEmergencySlot,
  deleteEmergencySlot,
  bookEmergencySlot,
  unbookEmergencySlot,
  deleteAllEmergencySlots,
};
