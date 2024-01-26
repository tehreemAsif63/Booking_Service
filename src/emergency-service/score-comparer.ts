import ScoreSchema from "../schemas/score";
import EmergencySlotSchema from "../schemas/emergencySlots";
import { MessageException } from "../exceptions/MessageException";
import { MessageHandler } from "../utilities/types-utils";

/**
 * About:
 * Though a user may have passed the passed the first filter, I thought that there should be a secondary filter depending on the demand.
 * The secondary filter depends on the supply of the emergency slots.
 * When the availability of the emergency slots (availableEmergencySlots / totalEmergencySlots) is higher than 0.4, the user can get a direct pass.
 * However, when the availability is lower than 0.4, the users have to have a higher score than the average.
 */
export async function calculateAverageScore() {
  try {
    const emergencyScores: { emergencyScore: number }[] =
      await ScoreSchema.find({}, "emergencyScore");

    emergencyScores.sort((a, b) => a.emergencyScore - b.emergencyScore);
    const numberOfScores = emergencyScores.length;

    const sumOfScores = emergencyScores.reduce(
      (accumulator, score) => accumulator + score.emergencyScore,
      0
    );

    const average = sumOfScores / numberOfScores;

    console.log("Average:", average);
  } catch (err) {
    console.error(err);
  }
}

/**
 * About:
 * As mentioned above, this function calculates the availability of the emergency slots.
 * The availability is checked by seein the ratio between All Slots available for the next day and the Booked Slots.
 * Availability = (Unbooked Slots) / (All Slots)
 */
export async function checkAvailability() {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const unbookedSlot: { _id: string }[] = await EmergencySlotSchema.find({
      start: {
        $gte: tomorrow,
        $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
      },
      booked: false,
    });

    const allSlots: { _id: string }[] = await EmergencySlotSchema.find({
      start: {
        $gte: tomorrow,
        $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    const numUnbookedSlots = unbookedSlot.length;
    const numAllSlots = allSlots.length;

    let availability = numUnbookedSlots / numAllSlots;

    if (numAllSlots == 0) {
      availability = 0;
      console.log("NumOfSlots is 0", numAllSlots);
      console.log("Availability: ", availability);
      return availability;
    } else {
      console.log("Availability: ", availability);
      return availability;
    }
  } catch (err) {
    console.error("An error occured while counting documents: ", err);
  }
}

/**
 * About:
 * This function is the part where our algorithm decides whether to activate the filter or not.
 * The preset value is currently 0.4
 */

let minAvailability = 0.4;

export async function isActivated(myScore) {
  try {
    const availability = await checkAvailability();
    const average = await calculateAverageScore();

    if (availability !== undefined && availability < minAvailability) {
      console.log("Filter Activated: ", myScore > average, average);
      return myScore > average;
    } else {
      return true;
    }
  } catch (err) {
    console.error("An error occured while comparing scores: ", err);
  }
}

export const setAvailability: MessageHandler = async (data, requestInfo) => {
  const { availability } = data;

  if (!requestInfo.user?.admin) {
    throw new MessageException({
      code: 403,
      message:
        "Only admins are allowed to modify the minimum availability criteria",
    });
  }

  if (Number(availability) < 0 || Number(availability) > 1) {
    throw new MessageException({
      code: 400,
      message: "Availability cannot be smaller than 0 or larger than 1",
    });
  }

  try {
    minAvailability = Number(availability);
    console.log(`Minimum availability is set as ${availability}`);
  } catch (err) {
    console.error("An error has occured: ", err);
  }
};

export default {
  setAvailability,
};
