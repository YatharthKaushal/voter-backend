// Monolithic Design

import mongoose from "mongoose";

const VoterSchema = new mongoose.Schema({
  voterId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  relativeName: { type: String }, // Husband/Father/Mother Name
  houseNo: { type: String },
  addressLine1: { type: String },
  addressLine2: { type: String },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  age: { type: Number },
  mobileNumber: { type: String },
  caste: { type: String },
  sectionDetails: { type: String }, // Number and Name of Sections in Part
  yadiNumber: { type: String },
  assemblyConstituencyNumber: { type: Number },
  assemblyConstituencyName: { type: String },
  assemblyReservationStatus: { type: String },
  lokSabhaConstituencyNumber: { type: Number },
  lokSabhaConstituencyName: { type: String },
  lokSabhaReservationStatus: { type: String },
  hometown: { type: String },
  policeStation: { type: String },
  taluka: { type: String },
  district: { type: String },
  pinCode: { type: String },
});

const Voter = mongoose.model("Voter", VoterSchema);

export default Voter;
