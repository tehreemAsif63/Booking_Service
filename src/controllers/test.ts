const bookEmergencySlot: MessageHandler = async (user_id, requestInfo) => {
    const stringUserId = requestInfo.user?.id;
  
    await deleteEmergencySlots(user_id, requestInfo);
  
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
  
      const bookedEmergencySlots: { user_id }[] = await EmergencySlotSchema.find({
        start: {
          $gte: tomorrow,
          $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
        },
        user_id: stringUserId,
      });
  
      const emergencySlots: {
        _id: string;
        clinic_id: Object;
      }[] = await EmergencySlotSchema.find({
        start: {
          $gte: tomorrow,
          $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
        },
        booked: false,
      });
  
      if (bookedEmergencySlots.length > 0) {
        const toBeBooked = emergencySlots.shift();
        const toBeBookedId = toBeBooked?._id;
        const clinicId = toBeBooked?.clinic_id;
  
        const clinicInfo = await clinicSchema.findOne(
          { _id: clinicId },
          "clinicName address"
        );
  
        const emergencySlot = await EmergencySlotSchema.findOne({
          _id: toBeBookedId,
        });
  
        const result = {
          ...emergencySlot?.toObject(),
          clinicName: clinicInfo?.clinicName,
          address: clinicInfo?.address,
        };
        console.log(result);
        return result;
      }
  
      if (emergencySlots.length > 0) {
        const toBeBooked = emergencySlots.shift();
        const toBeBookedId = toBeBooked?._id;
        const clinicId = toBeBooked?.clinic_id;
  
        const clinicInfo = await clinicSchema.findOne(
          { _id: clinicId },
          "clinicName address"
        );
  
        const emergencySlot = await EmergencySlotSchema.findByIdAndUpdate(
          toBeBookedId,
          {
            booked: true,
            user_id: stringUserId,
          },
          { new: true }
        );
  
        const result = {
          ...emergencySlot?.toObject(),
          clinicName: clinicInfo?.clinicName,
          address: clinicInfo?.address,
        };
        console.log(result);
        return result;
      } else {
        throw new MessageException({
          code: 404,
          message:
            "Sorry but our emergency booking system is at maximum capacity.",
        });
      }
    } catch (err) {
      console.error("An error occured: ", err);
    }
  };