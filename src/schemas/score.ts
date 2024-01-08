import { InferSchemaType } from "mongoose";
import mongoose, { Schema, Document } from "mongoose";
import { checkOverBarrier } from "../emergency-service/score-barrier";
import { checkBlackList } from "../emergency-service/ban-checker";
import {
  calculateAverageScore,
  checkAvailability,
  isActivated,
} from "../emergency-service/score-comparer";

interface IScore extends Document {
  emergencyScore: number;
  userId: string;
  createdAt: Date;
}

const scoreSchema = new Schema({
  emergencyScore: {
    type: Number,
    required: [true, "Emergency Score must be registered"],
  },
  userId: {
    type: String,
    required: [true, "User Id must be registered"],
  },
  blackList: {
    type: Boolean,
    //required: [true, "Blacklist information must be included"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

scoreSchema.post<IScore>("save", function (doc, next) {
  console.log("New document saved:", doc);

  // Filter 1: Checks if the score is higher than the barrier score.
  const isOverBarrier = checkOverBarrier(doc.emergencyScore);
  if (isOverBarrier) {
    console.log("Proceeding to the second filter");
    next();
    calculateAverageScore();
    checkAvailability();
    isActivated(doc.emergencyScore);
  } else {
    console.log("Not an emergency patient");
    next();
  }
});

export default mongoose.model<IScore>("Score", scoreSchema);
export type Score = InferSchemaType<typeof scoreSchema>;
