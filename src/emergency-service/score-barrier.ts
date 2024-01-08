/*
Method Explanation
 - checkOverBarrier
   Figure out if the emergency score is over the barrier.
 - countFunctionCalls
   Check the demand on the emergency reservation system.

The intention of this filter is to see if the user's emergency score is higher than the barrier score.
The barrier score is altered depending on the demand on the emergency service.
**/

const counter = {
  count: 0,
};

let currentDate = new Date().toDateString();

// Check the number of method calls per day
function countFunctionCalls(counter) {
  const today = new Date().toDateString();

  if (today !== currentDate) {
    counter.count = 0;
    currentDate = today;
  }
  counter.count++;
  return counter.count;
}

// Check if the emergency score is over the barrier or not
export function checkOverBarrier(emergencyScore) {
  const callsCount = countFunctionCalls(counter);

  if (callsCount < 10) {
    const isOverBarrier = emergencyScore >= 20;
    console.log(
      `Emergency score (${emergencyScore}) is over the barrier: ${isOverBarrier}`,
      callsCount
    );
    return isOverBarrier;
  } else if (callsCount >= 10 && callsCount < 50) {
    const isOverBarrier = emergencyScore > 30;
    console.log(
      `Emergency score (${emergencyScore}) is over the barrier: ${isOverBarrier}`
    );
    return isOverBarrier;
  } else {
    const isOverBarrier = emergencyScore > 40;
    console.log(
      `Emergency score (${emergencyScore}) is over the barrier: ${isOverBarrier}`
    );
    return isOverBarrier;
  }
}

// Debug line
/*
for (let i = 1; i <= 80; i++) {
  const number = i;
  const result = checkOverBarrier(number);
  console.log(result);
  console.log(counter);
}
**/
