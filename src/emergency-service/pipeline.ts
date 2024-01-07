import { getScore } from "../controllers/emergencySlots-controller";
import { checkOverBarrier } from "./score-barrier";

// Filter 1: Check if the user is blacklisted or not. (TODO)
const score = getScore();

if (checkOverBarrier(score)) {
  console.log("Over the barrier!!");
}
// Filter 2: Check if the score is valid or not.

// Filter 3: Compare the score with the other patients.

// Filter 4: Find the closest clinic and make a reservation there. (TODO)
