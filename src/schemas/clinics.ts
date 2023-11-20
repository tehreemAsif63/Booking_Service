import { InferSchemaType } from "mongoose";
import mongoose from "mongoose"

const Schema = mongoose.Schema;
;


const clinicSchema = new Schema({
    clinicName: {
        type: String,
        required: [true, "Clinic name must be registered"]
    },
    address: {
        type: String,
        unique: true,
        required: [true, "Address must be registered"]
    },
    workingDentists: [
        {
            type: Schema.Types.ObjectId,
            unique: true,
            ref: "Dentists",
        },
    ],
});

export default mongoose.model("Clinics", clinicSchema);
export type Clinic=InferSchemaType<typeof clinicSchema>;