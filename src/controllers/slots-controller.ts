/**const express = require("express");
const router = require("express").Router();
const Slots = require("../schemas/slots.js");

//Get all Slots
router.get("/", async () => {
    try {
        const allSlots = await Slots.find();
        res.status(200).json(allSlots);
    } catch (error) {
        res.status(404).json({ error: "Slots not found" });
    }
});

//Get a specific slot by entered ID
router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        
        const slot = await Slots.findById(id);
        if(!slot){ 
                    return res.status(404).json({ error: "Slot not found" }); }

        res.status(200).json(slot);
    } catch (error) {
        res.status(404).json({ error: "Slot not found" });
    }
});

//Creating a new Slot - We will use it to make them available
router.post("/", async (req, res) => {
    try {
        const newSlot = new Slots( { time: req.body.time, availability: req.body.availability } )
        const savedSlot = await newSlot.save();

        res.status(200).json(savedSlot);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});


//Deleting a specific slot by ID - We will use it to make a slot unavailable
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const deletedSlot = await Slots.findByIdAndDelete(id);
        if(!deletedSlot){ 
                         return res.status(404).json({ error: "Slot not found" }); }
        
        res.status(204).send();
    } catch (error) {
        res.status(404).json({ error: "Slot not found" });
    }
});

//Patch method to change Availability of a specific Slot
router.patch("/:id", async (req, res) => {
    try {

        //Will first check if the slot even exists before editing
        const slot = await Slots.findById(req.params.id);

        if(!slot){ 
            return res.status(404).json({ error: "Slot not found" }); }

    //To turn Availability On or Off(Toggle)
        slot.availability= !slot.availability;
        const updatedSlot = await slot.save();
        
    
        res.status(200).json(updatedSlot);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


module.exports = router;*/
