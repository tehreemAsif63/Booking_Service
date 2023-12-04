import SlotSchema, { Slot } from "../schemas/slots";
import { MessageException } from "../exceptions/MessageException";
import {
  MessageHandler,
  MessageData,
  RequestInfo,
} from "../utilities/types-utils";

*/

const getSlot: MessageHandler = async (data, requestInfo) => {
  

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
const getSlots: MessageHandler = async () => {
  const slots = await SlotSchema.find();

  if (!slots || slots.length === 0) {
    throw new MessageException({
      code: 404,
      message: "No slots found",
    });
  }

  return slots;
};



const createSlot: MessageHandler = async (data,requestInfo) => {
  if (requestInfo.user?.userType!=="dentist") {
    throw new MessageException({
      code: 403,
      message: "Forbidden",
    });
  }
  
  const { date, available, booked, clinicData = {
    dentistID:requestInfo.user.id,
    clinicID: data.clinic_id,
    date: new Date(),
  } } = data;

  // validate the data of the slot
  if (!(date && available && booked&&clinicData)) {
    // throw
    throw new MessageException({
      code: 403,
      message: "Input missing data, All data required",
    });
  }

  // validate the boolean values of the slot
  if (
    !(
      // assumes slots are avaliable and unbooked on creation
      (date && available == false && booked == true)
    )
  ) {
    // throw
    throw new MessageException({
      code: 403,
      message: "Fix input; data is invalid",
    });
  }

  // find a registered slot in DB
  const registeredSlot = SlotSchema.find({ date });

  // check if slot already registered in DB
  if ((await registeredSlot).length > 0) {
    throw new MessageException({
      code: 403,
      message: "Slot already exists for that time",
    });
  }

  const slot = new SlotSchema({
    date,
    available,
    booked,
    clinicData
  });

  slot.save();

  return slot;
};


// delete slot with a specific ID
const deleteSlot: MessageHandler = async (data) => {
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
const bookSlot: MessageHandler = async (data) => {
  var { slot_id, booked } = data;
  booked = true
  const slot = await SlotSchema.findByIdAndUpdate(
    slot_id,
    { booked },
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

const unbookSlot: MessageHandler = async (data) => {
  var { slot_id, booked } = data;
  booked = false
  const slot = await SlotSchema.findByIdAndUpdate(
    slot_id,
    { booked },
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

const deleteAllSlots: MessageHandler = async (data, requestInfo) => {
  if (requestInfo.user?.userType!=="dentist") {
    throw new MessageException({
      code: 403,
      message: "Forbidden",
    });
  }

  await SlotSchema.deleteMany(data);

  if (SlotSchema === null) {
    throw new MessageException({
      code: 400,
      message: "DataBase already empty",
    });
  }

  return "All Slots deleted";
};

export default {
  createSlot,
  getSlot,
  getSlots,
  deleteSlot,
  bookSlot,
  unbookSlot,
  deleteAllSlots
};
