import { MessageException } from "../exceptions/MessageException";
import { MessageHandler } from "../utilities/types-utils";

const counter = {
  count: 0,
};

let currentDate = new Date().toDateString();

let barrierScores = {
  low: 20,
  medium: 30,
  high: 40,
};

/**
 * About:
 * This function has been created with the intention to adjust the barrier to the access of emergency service based on the live demand.
 * The counter is reset at the start of the new day since our demand is based on a single day.
 */
function countFunctionCalls(counter) {
  const today = new Date().toDateString();

  if (today !== currentDate) {
    counter.count = 0;
    currentDate = today;
  }
  counter.count++;
  return counter.count;
}

/**
 * About:
 * Based on the counter value, the score that the patient has to pass increases.
 * Based on the highest score possible (63.4), I have set the barriers as 20, 30, 40 for honestly no particular reason.
 */

export function checkOverBarrier(emergencyScore) {
  const callsCount = countFunctionCalls(counter);

  if (callsCount < 10) {
    const isOverBarrier = emergencyScore >= barrierScores.low;
    console.log(
      `Emergency score (${emergencyScore}) is over the barrier: ${isOverBarrier}`,
      callsCount
    );
    return isOverBarrier;
  } else if (callsCount >= 10 && callsCount < 50) {
    const isOverBarrier = emergencyScore > barrierScores.medium;
    console.log(
      `Emergency score (${emergencyScore}) is over the barrier: ${isOverBarrier}`
    );
    return isOverBarrier;
  } else {
    const isOverBarrier = emergencyScore > barrierScores.high;
    console.log(
      `Emergency score (${emergencyScore}) is over the barrier: ${isOverBarrier}`
    );
    return isOverBarrier;
  }
}

export const setBarrierScores: MessageHandler = async (data, requestInfo) => {
  const { newLow, newMedium, newHigh } = data;

  if (!requestInfo.user?.admin) {
    throw new MessageException({
      code: 403,
      message: "Only admins are allowed to modify the barrier scores",
    });
  }

  if (
    !(Number(newLow) < Number(newMedium) && Number(newMedium) < Number(newHigh))
  ) {
    throw new MessageException({
      code: 400,
      message:
        "The barrier scores shall never violate this order: low < medium < high",
    });
  }
  try {
    (barrierScores.low = Number(newLow)),
      (barrierScores.medium = Number(newMedium)),
      (barrierScores.high = Number(newHigh)),
      console.log(
        "Changed the barrier scores to the Following: ",
        barrierScores
      );
  } catch (err) {
    console.error("An error has occured: ", err);
  }
};
export default {
  setBarrierScores,
};
