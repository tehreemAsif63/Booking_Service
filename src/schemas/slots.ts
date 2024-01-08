import { InferSchemaType } from "mongoose";
import clinics from "./clinics";
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const slotSchema = new Schema({
  start: {
    type: Date,
    required: [true, "Date and time must be registered"],
    
  },
  end: {
    type: Date,
    required: [true, "Date and time must be registered"],
    
  },
  booked: {
    type: Boolean,
    default: false,
  },
  clinic_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: clinics,
    required: false,
  },
  dentist_id: {
    type: String,
    required: true,
  },
  patient_id: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  booking_type: {
    type: String,
    required: false,
  },
});
slotSchema.index({start:1,dentist_id:1},{unique:true})
export default mongoose.model("Slot", slotSchema);
export type Slot = InferSchemaType<typeof slotSchema>;
