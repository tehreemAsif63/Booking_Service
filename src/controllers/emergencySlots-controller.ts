import EmergencySlotSchema from "../schemas/emergencySlots";
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

  const registeredSlot = EmergencySlotSchema.find({
    start,
    end,
    clinic_id,
    dentist_id,
  });

  if ((await registeredSlot).length > 0) {
    throw new MessageException({
      code: 403,
      message: "Slot already exists for that time",
    });
  }

  const emergencySlot = new EmergencySlotSchema({
    start,
    end,
    booked: false,
    dentist_id,
    clinic_id,
  });

  emergencySlot.save();
};

export const deleteEmergencySlot: MessageHandler = async (data) => {
  const { slot_id } = data;
  const emergencySlot = await EmergencySlotSchema.findById(slot_id);

  if (!emergencySlot) {
    throw new MessageException({
      code: 400,
      message: "Slot does not exist",
    });
  } else if (emergencySlot.booked) {
    throw new MessageException({
      code: 403,
      message: "Deleting a booked emergency slot is forbidden",
    });
  } else {
    EmergencySlotSchema.findByIdAndDelete(slot_id);
    console.log("Slot deleted!");
  }
};
export default {
  getScore,
  createEmergencySlot,
  deleteEmergencySlot,
};
