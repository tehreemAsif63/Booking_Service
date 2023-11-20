import { isObjectIdOrHexString } from "mongoose";

//An assertion method to configure the authority of a dentist account
const assertDentist = (dentist: object) => {
  if (dentist == isObjectIdOrHexString) {
    return dentist;
  }
  return {
    error: {
      code: 403,
      Message: "I mean it's illegal to fraud to be a doctor.",
    },
  };
};

export default { assertDentist };
