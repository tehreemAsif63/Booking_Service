import mqtt from "mqtt";
import mongoose from "mongoose";
import slotsController from "./controllers/slots-controller";
import clinicsController from "./controllers/clinics-controller";
import {
  MessageData,
  MessageHandler,
  MessagePayload,
} from "./utilities/types-utils";
import { MessageException } from "./exceptions/MessageException";
const mongoURI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Bookings";
const client = mqtt.connect(process.env.MQTT_URI || "mqtt://localhost:1883");

const messageMapping: { [key: string]: MessageHandler } = {
  "clinics/create": clinicsController.createClinic,
  "clinics/all": clinicsController.getAllClinics,
  "clinics/:clinic_id": clinicsController.getClinic,
  "clinics/update/:clinic_id": clinicsController.updateClinic,
  "clinics/delete/:clinic_id": clinicsController.deleteClinic,
  "clinics/delete": clinicsController.deleteAllClinics,
 //--------------
  "slots/create": slotsController.createSlot,
  "slots/all": slotsController. getSlots,
  "slots/:slot_id": slotsController.getSlot,
  "slots/update/:slot_id": slotsController.updateSlot,
  "slots/:slot_id/book": slotsController.bookSlot,
  "slots/:slot_id/unbook": slotsController.unBookSlot,
  "slots/delete/:slot_id": slotsController.deleteSlot,
  "slots/delete": slotsController.deleteAllSlots,
};

  
 
  
  
client.on("connect", () => {
  client.subscribe("clinics/#");
  client.subscribe("slots/#")
});

client.on("message", async (topic, message) => {
  console.log(message.toString());
  const handler = messageMapping[topic];
  if (handler) {
    const { payload, responseTopic, requestInfo } = JSON.parse(
      message.toString()
    ) as MessagePayload;
    try {
      const result = await handler(payload, requestInfo);
      client.publish(responseTopic, JSON.stringify({data:result}), { qos: 2 });
    } catch (error) {
      console.log(error);
      if (error instanceof MessageException) {
        client.publish(
          responseTopic,
          JSON.stringify({
            error: {
              code: error.code,
              message: error.message,
            },
          }),
          { qos: 2 }
        );
      }
      client.publish(
        responseTopic,
        JSON.stringify({
          error: {
            code: 500,
            message: (error as Error).message,
          },
        }),
        { qos: 2 }
      );
    }
  }

  //client.end();}
});

// Set URI to connect to

// Connect to MongoDB
mongoose
  .connect(mongoURI)
  .then(function () {
    console.log(`Connected to MongoDB with URI: ${mongoURI}`);
  })
  .catch(function (err) {
    if (err) {
      console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
      console.error(err.stack);
      process.exit(1);
    }
    console.log(`Connected to MongoDB with URI: ${mongoURI}`);
  });