import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    houseNo: { type: String },
    addressLine1: { type: String },
    addressLine2: { type: String },
    hometown: { type: String },
    policeStation: { type: String },
    taluka: { type: String },
    district: { type: String },
    pinCode: { type: String },
  },
  { _id: false }
);

const ConstituencySchema = new mongoose.Schema(
  {
    assembly: {
      number: { type: Number },
      name: { type: String },
      reservationStatus: { type: String },
    },
    lokSabha: {
      number: { type: Number },
      name: { type: String },
      reservationStatus: { type: String },
    },
    sectionDetails: { type: String }, // Number and Name of Sections in Part
    yadiNumber: { type: String },
  },
  { _id: false }
);

const PersonalInfoSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    relativeName: { type: String }, // Husband/Father/Mother Name
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    age: { type: Number },
    mobileNumber: { type: String },
    caste: { type: String },
  },
  { _id: false }
);

const VoterSchema = new mongoose.Schema({
  voterId: { type: String, required: true, unique: true },
  personalInfo: { type: PersonalInfoSchema, required: true },
  address: { type: AddressSchema },
  constituency: { type: ConstituencySchema },
});

export default mongoose.model("Voter", VoterSchema);
