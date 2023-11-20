import { InferSchemaType } from "mongoose";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * time: The date and time of the registered slot
 * availability: The availability of the registered slot
 */
const slotSchema = new Schema({
    time: {
        type: Date,
        required: [true, "Date and time must be registered"]
    },
    available: {
        type: Boolean,
        default: true
    },
    booked: {
        type: Boolean,
        default: false
    }
});

export default mongoose.model("Slot", slotSchema);
export type Slot=InferSchemaType<typeof slotSchema>;