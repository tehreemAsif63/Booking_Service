const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const clinics = require("../schemas/clinics");
/**
 * time: The date and time of the registered slot
 * availability: The availability of the registered slot
 * booked: Whether the slot is booked or not
 * emergencyScore: The emergency indicator for the patient
 */
const emergencySlotSchema = new Schema({
  time: {
    type: Date,
    required: [true, "Date and time must be registered"],
  },
  booked: {
    type: Boolean,
    default: false,
  },
  emergencyScore: {
    type: Number,
  },
  clinic_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: clinics,
    required: true,
  },
  dentist_id: {
    type: String,
    required: true,
  },
});

export default mongoose.model("EmergencySlot", emergencySlotSchema);
export type Slot = InferSchemaType<typeof emergencySlotSchema>;
