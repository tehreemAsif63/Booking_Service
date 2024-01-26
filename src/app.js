"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mqtt_1 = __importDefault(require("mqtt"));
const mongoose_1 = __importDefault(require("mongoose"));
const node_schedule_1 = __importDefault(require("node-schedule"));
const slots_controller_1 = __importDefault(require("./controllers/slots-controller"));
const clinics_controller_1 = __importDefault(require("./controllers/clinics-controller"));
const emergencySlots_controller_1 = __importDefault(require("./controllers/emergencySlots-controller"));
const score_1 = __importDefault(require("./schemas/score"));
const MessageException_1 = require("./exceptions/MessageException");
const mongoURI = process.env.MONGODB_URI ||
    "mongodb+srv://DIT356:gusdit356@clusterdit356.zpifkti.mongodb.net/BookingSystem?retryWrites=true&w=majority";
const client = mqtt_1.default.connect(process.env.MQTT_URI || "mqtt://localhost:1883");
const messageMapping = {
    "clinics/create": clinics_controller_1.default.createClinic,
    "clinics/all": clinics_controller_1.default.getAllClinics,
    "clinics/getOne": clinics_controller_1.default.getClinic,
    "clinics/update/:clinic_id": clinics_controller_1.default.updateClinic,
    "clinics/delete/:clinic_id": clinics_controller_1.default.deleteClinic,
    "clinics/delete": clinics_controller_1.default.deleteAllClinics,
    //--------------
    "slots/create/many": slots_controller_1.default.createSlots,
    "slots/create": slots_controller_1.default.createSlot,
    "slots/all": slots_controller_1.default.getSlots,
    "slots/patient": slots_controller_1.default.getPatientSlots,
    "slots/:slot_id": slots_controller_1.default.getSlot,
    "slots/clinic": slots_controller_1.default.getClinicSlots,
    "slots/dentist": slots_controller_1.default.getDentistSlots,
    "slots/update/:slot_id": slots_controller_1.default.updateSlot,
    "slots/:slot_id/book": slots_controller_1.default.bookSlot,
    "slots/:slot_id/unbook": slots_controller_1.default.unBookSlot,
    "slots/patient/delete": slots_controller_1.default.deletePatientSlots,
    "slots/delete/:slot_id": slots_controller_1.default.deleteSlot,
    "slots/delete": slots_controller_1.default.deleteAllSlots,
    //--------------
    "emergency-slots/score": emergencySlots_controller_1.default.getScore,
    "emergency-slots/create": emergencySlots_controller_1.default.createEmergencySlot,
    "emergency-slots/:date": emergencySlots_controller_1.default.getEmergencySlots,
    "emergency-slots/delete/:emergencySlot_id": emergencySlots_controller_1.default.deleteEmergencySlot,
    "emergency-slots/results": emergencySlots_controller_1.default.getResult,
};
client.on("connect", () => {
    client.subscribe("clinics/#");
    client.subscribe("slots/#");
    client.subscribe("emergency-slots/#");
});
client.on("message", (topic, message) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(message.toString());
    const handler = messageMapping[topic];
    if (handler) {
        const { payload, responseTopic, requestInfo } = JSON.parse(message.toString());
        try {
            const result = yield handler(payload, requestInfo);
            client.publish(responseTopic, JSON.stringify({ data: result }), {
                qos: 2,
            });
        }
        catch (error) {
            console.log(error);
            if (error instanceof MessageException_1.MessageException) {
                client.publish(responseTopic, JSON.stringify({
                    error: {
                        code: error.code,
                        message: error.message,
                    },
                }), { qos: 2 });
            }
            client.publish(responseTopic, JSON.stringify({
                error: {
                    code: 500,
                    message: error.message,
                },
            }), { qos: 2 });
        }
    }
    //client.end();}
}));
// Schedule resets for the score collection when the date changes.
const resetScoreDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield score_1.default.deleteMany({});
        console.log("Reset successful!");
    }
    catch (err) {
        console.error("An error occured:", err);
    }
});
const scheduleScoreReset = () => {
    node_schedule_1.default.scheduleJob("0 0 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
        yield resetScoreDB();
    }));
};
scheduleScoreReset();
// Set URI to connect to
// Connect to MongoDB
mongoose_1.default
    .connect(mongoURI)
    .then(function () {
    console.log(`Connected to MongoDB with URI: ${mongoURI}`);
    scheduleScoreReset();
})
    .catch(function (err) {
    if (err) {
        console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
        console.error(err.stack);
        process.exit(1);
    }
    console.log(`Connected to MongoDB with URI: ${mongoURI}`);
});
