import EmergencySlotSchema from "../schemas/emergencySlots";
import SlotSchema from "../schemas/slots";
import clinicSchema, { Clinic } from "../schemas/clinics";
import ScoreSchema from "../schemas/score";
import { MessageException } from "../exceptions/MessageException";
import mongoose from "mongoose";
import {
  MessageHandler,
  MessageData,
  RequestInfo,
} from "../utilities/types-utils";

export const getScore: MessageHandler = async (
  data: { score?: number },
  requestInfo
) => {
  const userId = requestInfo?.user?.id;

  if (requestInfo.user?.userType !== "patient") {
    throw new MessageException({
      code: 403,
      message: "Dentists are not allowed to book for emergency.",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(requestInfo?.user?.id)) {
    throw new MessageException({
      code: 400,
      message: "Valid user id needs to be specified",
    });
  }

  try {
    const emergencyScore = data?.score;

    if (
      emergencyScore === undefined ||
      emergencyScore < 0 ||
      emergencyScore > 63.4
    ) {
      throw new MessageException({
        code: 400,
        message: "Emergency score should be between 0 and 63.4",
      });
    }
  } catch (error) {
    console.error("Error in getScore:", error);
    throw error;
  }

  const submittedUser = ScoreSchema.find({ userId });
  if ((await submittedUser).length > 0) {
    throw new MessageException({
      code: 403,
      message: "You are only allowed to submit the form once a day.",
    });
  } else {
    const emergencyScores = new ScoreSchema({
      emergencyScore: data?.score,
      userId: requestInfo?.user?.id,
      blackList: requestInfo?.user?.blackList,
    });
    emergencyScores.save();
  }
};

export const createEmergencySlot: MessageHandler = async (
  data,
  requestInfo
) => {
  if (requestInfo.user?.userType !== "dentist") {
    throw new MessageException({
      code: 403,
      message: "Only dentists are allowed to perform this action.",
    });
  }

  const { start, end } = data as {
    start?: string;
    end?: string;
  };

  if (!start || !end) {
    throw new MessageException({
      code: 403,
      message: "Input missing data. All data required!",
    });
  }

  const clinic_id = requestInfo.user.clinic_id;
  const dentist_id = requestInfo.user.id;

  if (!mongoose.Types.ObjectId.isValid(dentist_id)) {
    throw new MessageException({
      code: 400,
      message: "Valid dentist Id is required",
    });
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new MessageException({
      code: 400,
      message: "Invalid date format for start or end.",
    });
  }

  const registeredSlot = await EmergencySlotSchema.find({
    start: startDate,
    end: endDate,
    clinic_id,
    dentist_id,
  });

  if (registeredSlot.length > 0) {
    throw new MessageException({
      code: 403,
      message: "The following slot already exists",
    });
  }

  const registerSlot = new EmergencySlotSchema({
    start: startDate,
    end: endDate,
    clinic_id,
    dentist_id,
  });

  registerSlot.save();
};

export const deleteEmergencySlot: MessageHandler = async (
  data,
  requestInfo
) => {
  const { emergencySlot_id } = data;

  const emergencySlot = await EmergencySlotSchema.findById(emergencySlot_id);

  if (requestInfo.user?.userType !== "dentist") {
    throw new MessageException({
      code: 403,
      message: "Only dentists are allowed to perform this action",
    });
  }
  if (emergencySlot?.booked == true) {
    throw new MessageException({
      code: 403,
      message: "Booked emergency slots are not allowed to be deleted.",
    });
  }
  if (!emergencySlot) {
    throw new MessageException({
      code: 404,
      message: "Emergency slot does not exist",
    });
  }

  try {
    await EmergencySlotSchema.deleteOne({ _id: emergencySlot_id });
    console.log("Slot deleted!", emergencySlot_id);
  } catch (err) {
    console.error("Error deleting slot: ", err);
  }
};

export const getEmergencySlots: MessageHandler = async (data, requestInfo) => {
  const { date } = data;

  const dentist_id = requestInfo.user?.id;
  const clinic_id = requestInfo.user?.clinic_id;

  const newDate = date as string;

  const startOfDay = new Date(newDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(newDate);
  endOfDay.setHours(23, 59, 59, 999);

  const emergencySlots = await EmergencySlotSchema.find({
    start: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    dentist_id,
    clinic_id,
  })
    .select("_id start end booked")
    .sort({ start: 1 });

  if (requestInfo.user?.userType !== "dentist") {
    throw new MessageException({
      code: 403,
      message: "Only dentists are allowed to perform this action",
    });
  }
  console.log(emergencySlots);
  return emergencySlots;
};

export const getResult: MessageHandler = async (data, requestInfo) => {
  const user_id = requestInfo.user?.id;
  try {
    const emergencyScore = await ScoreSchema.findOne({ userId: user_id });

    if (emergencyScore == null) {
      throw new MessageException({
        code: 403,
        message: "User not recognized.",
      });
    }

    const isEmergency = await (emergencyScore as any).isEmergency;

    if (isEmergency === false) {
      console.log("not emergency case");
      console.log(isEmergency);
    } else {
      console.log("Emergency case");
      bookEmergencySlot({ user_id }, requestInfo);
    }
  } catch (err) {
    console.error(err);
  }
};

const bookEmergencySlot: MessageHandler = async (user_id, requestInfo) => {
  const stringUserId = requestInfo.user?.id;

  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const bookedEmergencySlots: { user_id }[] = await EmergencySlotSchema.find({
      start: {
        $gte: tomorrow,
        $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
      },
      user_id: stringUserId,
    });

    if (bookedEmergencySlots.length > 0) {
      throw new MessageException({
        code: 403,
        message: "You have already booked for thsi date.",
      });
    }
    const emergencySlots: { _id: string }[] = await EmergencySlotSchema.find({
      start: {
        $gte: tomorrow,
        $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
      },
      booked: false,
    });

    if (emergencySlots.length > 0) {
      const toBeBooked = emergencySlots.shift();
      const toBeBookedId = toBeBooked?._id;

      const emergencySlot = await EmergencySlotSchema.findByIdAndUpdate(
        toBeBookedId,
        {
          booked: true,
          user_id: stringUserId,
        },
        { new: true }
      );
      console.log(emergencySlot);
      return emergencySlot;
    } else {
      throw new MessageException({
        code: 404,
        message:
          "Sorry but our emergency booking system is at maximum capacity.",
      });
    }
  } catch (err) {
    console.error("An error occured: ", err);
  }
};

export default {
  getScore,
  createEmergencySlot,
  deleteEmergencySlot,
  getEmergencySlots,
  getResult,
};
