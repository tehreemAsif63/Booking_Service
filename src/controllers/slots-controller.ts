import SlotSchema, { Slot } from "../schemas/slots";
import clinicSchema, { Clinic } from "../schemas/clinics";
import { MessageException } from "../exceptions/MessageException";
import {
  MessageHandler,
  MessageData,
  RequestInfo,
} from "../utilities/types-utils";

export const createSlot: MessageHandler = async (data, requestInfo) => {
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
        "To be able to create a slot, you have to be assigned to a clinic",
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

  // find a registered slot in DB
  const registeredSlot = SlotSchema.find({ date, clinic_id, dentist_id });

  // check if slot already registered in DB
  if ((await registeredSlot).length > 0) {
    throw new MessageException({
      code: 403,
      message: "Slot already exists for that time",
    });
  }

  const slot = new SlotSchema({
    date,
    booked: false,
    dentist_id,
    clinic_id,
  });

  slot.save();

  return slot;
};

export const getSlot: MessageHandler = async (data, requestInfo) => {
  const { slot_id } = data;
  const slot = await SlotSchema.findById(slot_id);

  if (!slot) {
    throw new MessageException({
      code: 400,
      message: "Invalid slot ID",
    });
  }

  if (slot === null) {
    throw new MessageException({
      code: 400,
      message: "Slot does not exist",
    });
  }

  return slot;
};

//Get all slots
export const getSlots: MessageHandler = async () => {
  const slots = await SlotSchema.find();

  if (!slots || slots.length === 0) {
    throw new MessageException({
      code: 404,
      message: "No slots found",
    });
  }

  return slots;
};

// updateSlot fields -PATCH
export const updateSlot: MessageHandler = async (data, requestInfo) => {
  if (requestInfo.user?.userType !== "dentist") {
    throw new MessageException({
      code: 403,
      message: "Forbidden. Only dentists can perform this action.",
    });
  }
  const {
    slot_id,
    date,
    dentistId,
    clinic_id,
    patient_id,
    description,
    booking_type,
  } = data;
  console.log("slotID", slot_id);
  // Check if the slot with the given ID exists
  const existingSlot = await SlotSchema.findById(slot_id);
  if (!existingSlot) {
    throw new MessageException({
      code: 400,
      message: "Slot not found",
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
  const updatedSlot = await SlotSchema.findByIdAndUpdate(
    slot_id,
    {
      date,
      dentist_id: dentistId,
      clinic_id,
      patient_id,
      description,
      booking_type,
    },
    { new: true, runValidators: true }
  );

  if (!updatedSlot) {
    throw new MessageException({
      code: 500,
      message: "Failed to update slot",
    });
  }

  return updatedSlot;
};

// delete slot with a specific ID
export const deleteSlot: MessageHandler = async (data) => {
  const { slot_id } = data;

  const slot = await SlotSchema.findByIdAndDelete(slot_id);

  if (!slot) {
    throw new MessageException({
      code: 400,
      message: "Invalid id",
    });
  }

  if (slot === null) {
    throw new MessageException({
      code: 400,
      message: "Slot does not exist",
    });
  }
  return "Slot deleted";
};

/*
It should be bookSlot
and another one to UnbookSlot
*/
export const bookSlot: MessageHandler = async (data) => {
  var { slot_id, booked, patient_id, description, booking_type } = data;
  var slot = null;
  // booked = false
  const mongoose = require("mongoose");
  // checks description and booking type are not null
  if (!description || !booking_type) {
    throw new MessageException({
      code: 400,
      message: "Description and booking type needs to be specified",
    });
  }

  // verify it's a real object id
  if (mongoose.Types.ObjectId.isValid(patient_id)) {
    slot = await SlotSchema.findByIdAndUpdate(
      slot_id,
      { booked: true, patient_id, description, booking_type },
      { new: true }
    );
  } else {
    throw new MessageException({
      code: 400,
      message: "Valid patient ID needs to be specified",
    });
  }

  if (!slot) {
    throw new MessageException({
      code: 404,
      message: "Slot not found for update",
    });
  }
  return slot;
};

export const unBookSlot: MessageHandler = async (data) => {
  var { slot_id, booked } = data;
  // booked = false;
  const slot = await SlotSchema.findByIdAndUpdate(
    slot_id,
    { booked: false, patient_id: null, description: null, booking_type: null },
    { new: true }
  );

  if (!slot) {
    throw new MessageException({
      code: 404,
      message: "Slot not found for update",
    });
  }
  return slot;
};

export const deleteAllSlots: MessageHandler = async (data, requestInfo) => {
  if (requestInfo.user?.userType !== "dentist") {
    throw new MessageException({
      code: 403,
      message: "Forbidden",
    });
  }

  if (SlotSchema.length >= 1) {
    await SlotSchema.deleteMany(data);
    return "All Slots deleted";
  } else {
    throw new MessageException({
      code: 400,
      message: "Database already empty",
    });
  }
};

export default {
  createSlot,
  getSlot,
  getSlots,
  updateSlot,
  deleteSlot,
  bookSlot,
  unBookSlot,
  deleteAllSlots,
};
