/* TODO
Functionality: Among the users who are qualified to reserve the emergency slots, some prioritization may need to be made.
Once the 50% of the emergency slots are filled up, we are going to activate this filter to see whether the user should be qualified for
the emergency slot or not.
**/
import UserSchema from "../schemas/users";
import ScoreSchema from "../schemas/score";
import EmergencySlotSchema from "../schemas/emergencySlots";

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

export async function checkAvailability() {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const unbookedSlot: number = await EmergencySlotSchema.find({
      time: {
        $gte: tomorrow,
        $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
      },
      booked: false,
    }).countDocuments();

    const emergencyScores: { emergencyScore: number }[] =
      await ScoreSchema.find({}, "emergencyScore");

    const numberOfScores = emergencyScores.length;
    const availability = unbookedSlot / numberOfScores;

    console.log("Availability: ", availability);
    return availability;
  } catch (err) {
    console.error("An error occured while counting documents: ", err);
  }
}

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
