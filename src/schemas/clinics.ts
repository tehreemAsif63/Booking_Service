import { InferSchemaType } from "mongoose";
import mongoose from "mongoose";

const Schema = mongoose.Schema;
const clinicSchema = new Schema({
  clinicName: {
    type: String,
    required: [true, "Clinic name must be registered"],
  },
  address: {
    type: String,
    unique: true,
    required: [true, "Address must be registered"],
  },
  workingDentists: [
    {
      type: String,
      required: false,
    },
  ],
});

export default mongoose.model("Clinic", clinicSchema);
export type Clinic = InferSchemaType<typeof clinicSchema>;
