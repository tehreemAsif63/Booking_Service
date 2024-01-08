import ScoreSchema from "../schemas/score";
import EmergencySlotSchema from "../schemas/emergencySlots";

/**
 * About:
 * Though a user may have passed the passed the first filter, I thought that there should be a secondary filter depending on the demand.
 * The secondary filter depends on the supply of the emergency slots.
 * When the availability of the emergency slots (score / availableEmergencySlots) is higher than 0.4, the user can get a direct pass.
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

const average = calculateAverageScore();

/**
 * About:
 * As mentioned above, this function calculates the availability of the emergency slots.
 * I decided to use the number of emergencyScores because we only allow one submission per day.
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

    const numSlots = unbookedSlot.length;

    const emergencyScores: { emergencyScore: number }[] =
      await ScoreSchema.find({}, "emergencyScore");

    const numberOfScores = emergencyScores.length;
    const availability = numSlots / numberOfScores;

    console.log("Unbooked Slots: ", numSlots);
    console.log("Availability: ", availability);
    return availability;
  } catch (err) {
    console.error("An error occured while counting documents: ", err);
  }
}

/**
 * About:
 * This function is the part where our algorithm decides whether to activate the filter or not.
 * The preset value is currently 0.4
 */
export async function isActivated(myScore) {
  try {
    const availability = await checkAvailability();

    if (availability !== undefined && availability < 0.4) {
      console.log("Filter Activated: ", myScore > average);
      return myScore > average;
    } else {
      return true;
    }
  } catch (err) {
    console.error("An error occured while comparing scores: ", err);
  }
}
