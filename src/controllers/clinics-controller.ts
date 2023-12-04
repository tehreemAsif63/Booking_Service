import clinicSchema, { Clinic } from "../schemas/clinics";
import { MessageException } from "../exceptions/MessageException";
import { MessageHandler, RequestInfo} from "../utilities/types-utils";

//Method for admin access check
const checkAdminAccess = (requestInfo: RequestInfo) => {
  if (!requestInfo.user?.admin) {
    throw new MessageException({
      code: 403,
      message: "Forbidden. Only admins can perform this action.",
    });
  }
};


//creating a clinic- POST
const createClinic: MessageHandler = async (data, requestInfo) => {
  
    const { clinicName, address, workingDentists} = data;
  
    // Check if the user is an admin
      checkAdminAccess(requestInfo);

    // validate the data of the patient clinicName: address: workingDentists:
    if (!clinicName || !address || !workingDentists) {
      throw new MessageException({
          code: 403,
          message: "Input missing data, All input fields are required to be filled.",
      });
     }
    
    // find a registered Clinic in DB
    const registeredClinic = await clinicSchema.find({ clinicName, address });
    // check if clinic already registered in DB
    if ((await registeredClinic).length > 0) {
      throw new MessageException({
        code: 403,
        message: "Forbidden. Clinic already exists",
      });
    }
     // Create a new clinic
     const newClinic = new clinicSchema({
      clinicName,
      address,
      workingDentists,
  });
 
   // Save the clinic to the database
   await newClinic.save();
   return newClinic;
};




//getting all clinics- GET 
const getAllClinics: MessageHandler = async (data) => {

try{ 
  const allClinics = await clinicSchema.find({});

    // Check if any clinic exists
    if (allClinics.length > 0) {
      return allClinics;
    } else {
      throw new MessageException({
        code: 404,
        message: "No clinic found",
      });
    }
  
} catch (error) {
    throw new MessageException({
      code: 500,
      message: "Failed to find clinics",
    });
}
};





  // getting Clinic with a specific id- GET/:id
    const getClinic: MessageHandler = async (data) => {
    const { clinic_id } = data;
    const clinic = await clinicSchema.findById(clinic_id);
  
    if (!clinic) {
      throw new MessageException({
        code: 404,
        message: "Not Found. Clinic does not exists.",
      });
    }
  
    return clinic;
  };



// updateClinic fields -PATCH
const updateClinic: MessageHandler = async (data, requestInfo) => {
   const { clinic_id, clinicUpdates} = data;
  
  // Check if the user is an admin
  checkAdminAccess(requestInfo);

  // Check if clinicUpdates is provided and not empty
  if (!clinic_id || !clinicUpdates || Object.keys(clinicUpdates).length === 0) {
    throw new MessageException({
        code: 400,
        message: "Bad Request. Invalid request data",
    });
}

// Check if the clinic with the given ID exists
const existingClinic = await clinicSchema.findById(clinic_id);
if (!existingClinic) {
    throw new MessageException({
        code: 400,
        message: "Not Found. Clinic not found",
    });
}

// Perform the partial update
const updatedClinic = await clinicSchema.findByIdAndUpdate(
    clinic_id,
    clinicUpdates,
    { new: true, runValidators: true } 
);

if (!updatedClinic) {
    throw new MessageException({
        code: 500,
        message: "Internal Server Error. Failed to update clinic",
    });
}

return updatedClinic;
};



  // delete clinic with a specific ID
const deleteClinic: MessageHandler = async (data, requestInfo) => {
    const { clinic_id} = data;
  
   // Check if the user is an admin
   checkAdminAccess(requestInfo);

    

    try {
      const clinic = await clinicSchema.findByIdAndDelete(clinic_id);
      return `Clinic deleted successfully.`;

    } catch (error) {
      throw new MessageException({
          code: 404,
          message: "Not Found. Clinic does not exist.",
      });
    }
  }
    

  //Delete all clinics method
  const deleteAllClinics: MessageHandler = async (data, requestInfo) => {

     // Check if the user is an admin
     checkAdminAccess(requestInfo);

    try {
      const result = await clinicSchema.deleteMany({});
      return `Deleted ${result.deletedCount} clinics`;

    } catch (error) {
      throw new MessageException({
          code: 500,
          message: "Failed to delete clinics",
      });
    }
  }



export default {
  createClinic,
  getAllClinics,
  getClinic,
  updateClinic,
  deleteClinic,
  deleteAllClinics,
};


