const mqtt = require("mqtt");
const client = mqtt.connect('mqtt://broker.hivemq.com');

// Should be set as QoS 1.
// Critical to guarantee the status of delivery.
// But no need to worry about duplicates since it is kind of idempotent.
client.on('connect', function() {
    client.subscribe("appointments/normal");
    console.log("Succeccfully subscribed to the normal appointment data!")
    client.subscribe("appointments/emergency");
    console.log("Successfully subscribed to the emergency appointment data!")
})