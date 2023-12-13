/*
TODO
Admin shall be able to manually change the barriers

Method Explanation
 - checkOverBarrier
   Figure out if the emergency score is over the barrier.
 - countFunctionCalls
   Check the demand on the emergency reservation system.
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
function checkOverBarrier(emergencyScore) {
  const callsCount = countFunctionCalls(counter);
  if (callsCount < 30) {
    return emergencyScore >= 40;
  } else if (callsCount >= 30 && callsCount < 50) {
    return emergencyScore > 60;
  } else {
    return emergencyScore > 70;
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
