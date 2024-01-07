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

export default {
  getScore,
};
