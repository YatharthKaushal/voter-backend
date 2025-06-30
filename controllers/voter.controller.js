import Voter from "../models/VoterModel.js";
import { createObjectCsvWriter } from "csv-writer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import Papa from "papaparse";

// Create Voter
export const createVoter = async (req, res) => {
  try {
    const newVoter = new Voter(req.body);
    await newVoter.save();
    res.status(201).json(newVoter);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Read Voter by ID
export const getVoterById = async (req, res) => {
  try {
    const voter = await Voter.findById(req.params.id);
    if (!voter) return res.status(404).json({ message: "Voter not found" });
    res.status(200).json(voter);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Voters by Voter ID
export const getVotersByVoterId = async (req, res) => {
  try {
    const voters = await Voter.find({ voterId: req.params.voterId });
    if (voters.length === 0)
      return res.status(404).json({ message: "No voters found" });
    res.status(200).json(voters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Voter
export const updateVoter = async (req, res) => {
  try {
    const updated = await Voter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Voter not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete Voter
export const deleteVoter = async (req, res) => {
  try {
    const deleted = await Voter.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Voter not found" });
    res.status(200).json({ message: "Voter deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// All Voters
export const allVoters = async (req, res) => {
  try {
    const voters = await Voter.find();
    const total = await Voter.countDocuments();
    res.status(200).json({
      total,
      totalPages: Math.ceil(total / 25),
      data: voters,
    });
  } catch (err) {
    console.log("> all voters: ", err);
    res.status(500).json({ message: err.message });
  }
};

// Pagination Function
export const paginateVoters = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;

  if (page < 1 || limit < 1) {
    console.log("> Invalid page or limit parameters:", { page, limit });
    return res.status(400).json({ message: "Invalid page or limit parameters" });
  }

  try {
    const voters = await Voter.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    const total = await Voter.countDocuments();

    res.status(200).json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: voters,
    });
  } catch (err) {
    console.log("> Error in paginateVoters:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Bulk Import JSON
export const bulkImportVoters = async (req, res) => {
  try {
    const voters = req.body;
    if (!Array.isArray(voters)) {
      return res.status(400).json({ message: "Invalid input format" });
    }
    const inserted = await Voter.insertMany(voters);
    res.status(201).json(inserted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Bulk Import CSV
export const bulkImportVotersCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const csvData = await fs.readFile(req.file.path, "utf-8");
    const result = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transform: (value, field) => {
        if (value === "Missing" || value === "") return undefined;
        if (field === "Age") return value ? parseInt(value) : undefined;
        if (
          field === "Assembly Constituency Number" ||
          field === "Lok Sabha Constituency Number"
        ) {
          return value ? parseInt(value) : undefined;
        }
        return value;
      },
    });

    if (result.errors.length > 0) {
      return res.status(400).json({ message: "Invalid CSV format: " + result.errors[0].message });
    }

    const voters = result.data.map((row) => ({
      voterId: row["Voter ID"],
      fullName: row["Full Name"],
      firstName: row["First Name"],
      lastName: row["Last Name"],
      relativeName: row["Relative Name"],
      houseNo: row["House Number"],
      addressLine1: row["Address Line 1"],
      addressLine2: row["Address Line 2"],
      gender: row["Gender"],
      age: row["Age"],
      mobileNumber: row["Mobile Number"],
      caste: row["Caste"],
      sectionDetails: row["Section Details"],
      yadiNumber: row["Yadi Number"],
      assemblyConstituencyNumber: row["Assembly Constituency Number"],
      assemblyConstituencyName: row["Assembly Constituency Name"],
      assemblyReservationStatus: row["Assembly Reservation Status"],
      lokSabhaConstituencyNumber: row["Lok Sabha Constituency Number"],
      lokSabhaConstituencyName: row["Lok Sabha Constituency Name"],
      lokSabhaReservationStatus: row["Lok Sabha Reservation Status"],
      hometown: row["Hometown"],
      policeStation: row["Police Station"],
      taluka: row["Taluka"],
      district: row["District"],
      pinCode: row["Pin Code"],
    }));

    const requiredFields = ["voterId", "fullName", "gender"];
    for (const voter of voters) {
      for (const field of requiredFields) {
        if (!voter[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
    }

    const inserted = await Voter.insertMany(voters);
    await fs.unlink(req.file.path); // Clean up uploaded file
    res.status(201).json({ message: `Successfully imported ${inserted.length} voters` });
  } catch (err) {
    console.error("Error importing CSV:", err);
    res.status(500).json({ message: err.message || "Failed to import voters" });
  }
};

// Bulk Export JSON
export const bulkExportVoters = async (req, res) => {
  try {
    const voters = await Voter.find();
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=voters.json");
    res.status(200).send(JSON.stringify(voters, null, 2));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Export Voters to CSV
export const exportVotersToCSV = async (req, res) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  try {
    const voters = await Voter.find().limit(4000).lean();
    if (!voters.length) {
      return res.status(404).json({ message: "No voter data found" });
    }

    const date = new Date();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const fileName = `${minutes}_${hours}_${day}_${month}_${year}.csv`;
    const filePath = path.join(__dirname, "..", "temp", fileName);

    await fs.mkdir(path.join(__dirname, "..", "temp"), { recursive: true });

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: "voterId", title: "Voter ID" },
        { id: "fullName", title: "Full Name" },
        { id: "firstName", title: "First Name" },
        { id: "lastName", title: "Last Name" },
        { id: "relativeName", title: "Relative Name" },
        { id: "houseNo", title: "House Number" },
        { id: "addressLine1", title: "Address Line 1" },
        { id: "addressLine2", title: "Address Line 2" },
        { id: "gender", title: "Gender" },
        { id: "age", title: "Age" },
        { id: "mobileNumber", title: "Mobile Number" },
        { id: "caste", title: "Caste" },
        { id: "sectionDetails", title: "Section Details" },
        { id: "yadiNumber", title: "Yadi Number" },
        { id: "assemblyConstituencyNumber", title: "Assembly Constituency Number" },
        { id: "assemblyConstituencyName", title: "Assembly Constituency Name" },
        { id: "assemblyReservationStatus", title: "Assembly Reservation Status" },
        { id: "lokSabhaConstituencyNumber", title: "Lok Sabha Constituency Number" },
        { id: "lokSabhaConstituencyName", title: "Lok Sabha Constituency Name" },
        { id: "lokSabhaReservationStatus", title: "Lok Sabha Reservation Status" },
        { id: "hometown", title: "Hometown" },
        { id: "policeStation", title: "Police Station" },
        { id: "taluka", title: "Taluka" },
        { id: "district", title: "District" },
        { id: "pinCode", title: "Pin Code" },
      ],
    });

    await csvWriter.writeRecords(voters);
    res.download(filePath, fileName, async (err) => {
      if (err) {
        console.error("Error sending file:", err);
        return res.status(500).json({ message: "Error sending file" });
      }
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    });
  } catch (error) {
    console.error("Error exporting voters to CSV:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Search Voters with Filters
export const searchVoters = async (req, res) => {
  try {
    const filters = {};
    const allowedFilters = [
      "fullName",
      "gender",
      "age",
      "caste",
      "district",
      "assemblyConstituencyName",
      "lokSabhaConstituencyName",
    ];
    for (const key of allowedFilters) {
      if (req.query[key]) {
        filters[key] = new RegExp(req.query[key], "i");
      }
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 25;
    const voters = await Voter.find(filters)
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Voter.countDocuments(filters);

    res.status(200).json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: voters,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Voter Stats
export const getVoterStats = async (req, res) => {
  try {
    const stats = {};

    const totalVotersPromise = Voter.countDocuments();
    const genderDistributionPromise = Voter.aggregate([
      { $group: { _id: "$gender", count: { $sum: 1 } } },
    ]);
    const ageGroupDistributionPromise = Voter.aggregate([
      {
        $bucket: {
          groupBy: "$age",
          boundaries: [18, 25, 35, 45, 55, 65, Infinity],
          default: "Other",
          output: { count: { $sum: 1 } },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const ageStatisticsPromise = Voter.aggregate([
      {
        $group: {
          _id: null,
          averageAge: { $avg: "$age" },
          minAge: { $min: "$age" },
          maxAge: { $max: "$age" },
          stdDevAge: { $stdDevPop: "$age" },
        },
      },
      { $project: { _id: 0 } },
    ]);
    const districtDistributionPromise = Voter.aggregate([
      { $group: { _id: "$district", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const assemblyConstituencyDistributionPromise = Voter.aggregate([
      { $group: { _id: "$assemblyConstituencyName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const lokSabhaConstituencyDistributionPromise = Voter.aggregate([
      { $group: { _id: "$lokSabhaConstituencyName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const missingHouseNoPromise = Voter.countDocuments({ houseNo: "Missing" });
    const missingAddressLine1Promise = Voter.countDocuments({ addressLine1: "Missing" });
    const missingAddressLine2Promise = Voter.countDocuments({ addressLine2: "Missing" });
    const missingMobileNumberPromise = Voter.countDocuments({ mobileNumber: "Missing" });
    const missingCastePromise = Voter.countDocuments({ caste: "Missing" });

    const [
      totalVoters,
      genderDistribution,
      ageGroupDistribution,
      ageStatistics,
      districtDistribution,
      assemblyConstituencyDistribution,
      lokSabhaConstituencyDistribution,
      missingHouseNo,
      missingAddressLine1,
      missingAddressLine2,
      missingMobileNumber,
      missingCaste,
    ] = await Promise.all([
      totalVotersPromise,
      genderDistributionPromise,
      ageGroupDistributionPromise,
      ageStatisticsPromise,
      districtDistributionPromise,
      assemblyConstituencyDistributionPromise,
      lokSabhaConstituencyDistributionPromise,
      missingHouseNoPromise,
      missingAddressLine1Promise,
      missingAddressLine2Promise,
      missingMobileNumberPromise,
      missingCastePromise,
    ]);

    stats.totalVoters = totalVoters;
    stats.genderDistribution = genderDistribution;
    stats.ageGroupDistribution = ageGroupDistribution;
    stats.ageStatistics = ageStatistics[0] || {};
    stats.geographicalDistribution = {
      district: districtDistribution,
      assemblyConstituency: assemblyConstituencyDistribution,
      lokSabhaConstituency: lokSabhaConstituencyDistribution,
    };
    stats.missingDataCounts = {
      houseNo: missingHouseNo,
      addressLine1: missingAddressLine1,
      addressLine2: missingAddressLine2,
      mobileNumber: missingMobileNumber,
      caste: missingCaste,
    };
    stats.missingDataPercentages = {
      houseNo: ((missingHouseNo / totalVoters) * 100).toFixed(2),
      addressLine1: ((missingAddressLine1 / totalVoters) * 100).toFixed(2),
      addressLine2: ((missingAddressLine2 / totalVoters) * 100).toFixed(2),
      mobileNumber: ((missingMobileNumber / totalVoters) * 100).toFixed(2),
      caste: ((missingCaste / totalVoters) * 100).toFixed(2),
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching voter stats:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


//import Voter from "../models/VoterModel.js";
//import { createObjectCsvWriter } from "csv-writer";
//import path from "path";
//import fs from "fs/promises";
//import { fileURLToPath } from "url";
//import Papa from "papaparse";
//
// Create Voter
//export const createVoter = async (req, res) => {
//  try {
//    const newVoter = new Voter(req.body);
//    await newVoter.save();
//    res.status(201).json(newVoter);
//  } catch (err) {
//    res.status(400).json({ message: err.message });
//  }
//};
//
// Read Voter by ID
//export const getVoterById = async (req, res) => {
//  try {
//    const voter = await Voter.findById(req.params.id);
//    if (!voter) return res.status(404).json({ message: "Voter not found" });
//    res.status(200).json(voter);
//  } catch (err) {
//    res.status(500).json({ message: err.message });
//  }
//};
//
// Get Voters by Voter ID
//export const getVotersByVoterId = async (req, res) => {
//  try {
//    const voters = await Voter.find({ voterId: req.params.voterId });
//    if (voters.length === 0)
//      return res.status(404).json({ message: "No voters found" });
//    res.status(200).json(voters);
//  } catch (err) {
//    res.status(500).json({ message: err.message });
//  }
//};
//
// Update Voter
//export const updateVoter = async (req, res) => {
//  try {
//    const updated = await Voter.findByIdAndUpdate(req.params.id, req.body, { new: true });
//    if (!updated) return res.status(404).json({ message: "Voter not found" });
//    res.status(200).json(updated);
//  } catch (err) {
//    res.status(400).json({ message: err.message });
//  }
//};
//
// Delete Voter
//export const deleteVoter = async (req, res) => {
//  try {
//    const deleted = await Voter.findByIdAndDelete(req.params.id);
//    if (!deleted) return res.status(404).json({ message: "Voter not found" });
//    res.status(200).json({ message: "Voter deleted" });
//  } catch (err) {
//    res.status(500).json({ message: err.message });
//  }
//};
//
// All Voters
//export const allVoters = async (req, res) => {
//  try {
//    const voters = await Voter.find();
//    const total = await Voter.countDocuments();
//    res.status(200).json({
//      total,
//      totalPages: Math.ceil(total / 25),
//      data: voters,
//    });
//  } catch (err) {
//    console.log("> all voters: ", err);
//    res.status(500).json({ message: err.message });
//  }
//};
//
// Pagination Function
//export const paginateVoters = async (req, res) => {
//  const page = parseInt(req.query.page) || 1;
//  const limit = parseInt(req.query.limit) || 25;
//
//  if (page < 1 || limit < 1) {
//    console.log("> Invalid page or limit parameters:", { page, limit });
//    return res.status(400).json({ message: "Invalid page or limit parameters" });
//  }
//
//  try {
//    const voters = await Voter.find()
//      .skip((page - 1) * limit)
//      .limit(limit)
//      .lean();
//    const total = await Voter.countDocuments();
//
//    res.status(200).json({
//      total,
//      page,
//      totalPages: Math.ceil(total / limit),
//      data: voters,
//    });
//  } catch (err) {
//    console.log("> Error in paginateVoters:", err);
//    res.status(500).json({ message: "Server error", error: err.message });
//  }
//};
//
// Bulk Import JSON
//export const bulkImportVoters = async (req, res) => {
//  try {
//    const voters = req.body;
//    if (!Array.isArray(voters)) {
//      return res.status(400).json({ message: "Invalid input format" });
//    }
//    const inserted = await Voter.insertMany(voters);
//    res.status(201).json(inserted);
//  } catch (err) {
//    res.status(500).json({ message: err.message });
//  }
//};
//
// Bulk Import CSV
//export const bulkImportVotersCSV = async (req, res) => {
//  try {
//    if (!req.file) {
//      return res.status(400).json({ message: "No file uploaded" });
//    }
//
//    const csvData = await fs.readFile(req.file.path, "utf-8");
//    const result = Papa.parse(csvData, {
//      header: true,
//      skipEmptyLines: true,
//      transform: (value, field) => {
//        if (value === "Missing" || value === "") return undefined;
//        if (field === "Age") return value ? parseInt(value) : undefined;
//        if (
//          field === "Assembly Constituency Number" ||
//          field === "Lok Sabha Constituency Number"
//        ) {
//          return value ? parseInt(value) : undefined;
//        }
//        return value;
//      },
//    });
//
//    if (result.errors.length > 0) {
//      return res.status(400).json({ message: "Invalid CSV format: " + result.errors[0].message });
//    }
//
//    const voters = result.data.map((row) => ({
//      voterId: row["Voter ID"],
//      fullName: row["Full Name"],
//      firstName: row["First Name"],
//      lastName: row["Last Name"],
//      relativeName: row["Relative Name"],
//      houseNo: row["House Number"],
//      addressLine1: row["Address Line 1"],
//      addressLine2: row["Address Line 2"],
//      gender: row["Gender"],
//      age: row["Age"],
//      mobileNumber: row["Mobile Number"],
//      caste: row["Caste"],
//      sectionDetails: row["Section Details"],
//      yadiNumber: row["Yadi Number"],
//      assemblyConstituencyNumber: row["Assembly Constituency Number"],
//      assemblyConstituencyName: row["Assembly Constituency Name"],
//      assemblyReservationStatus: row["Assembly Reservation Status"],
//      lokSabhaConstituencyNumber: row["Lok Sabha Constituency Number"],
//      lokSabhaConstituencyName: row["Lok Sabha Constituency Name"],
//      lokSabhaReservationStatus: row["Lok Sabha Reservation Status"],
//      hometown: row["Hometown"],
//      policeStation: row["Police Station"],
//      taluka: row["Taluka"],
//      district: row["District"],
//      pinCode: row["Pin Code"],
//    }));
//
//    const requiredFields = ["voterId", "fullName", "gender"];
//    for (const voter of voters) {
//      for (const field of requiredFields) {
//        if (!voter[field]) {
//          throw new Error(`Missing required field: ${field}`);
//        }
//      }
//    }
//
//    const inserted = await Voter.insertMany(voters);
//    await fs.unlink(req.file.path); // Clean up uploaded file
//    res.status(201).json({ message: `Successfully imported ${inserted.length} voters` });
//  } catch (err) {
//    console.error("Error importing CSV:", err);
//    res.status(500).json({ message: err.message || "Failed to import voters" });
//  }
//};
//
// Bulk Export JSON
//export const bulkExportVoters = async (req, res) => {
//  try {
//    const voters = await Voter.find();
//    res.setHeader("Content-Type", "application/json");
//    res.setHeader("Content-Disposition", "attachment; filename=voters.json");
//    res.status(200).send(JSON.stringify(voters, null, 2));
//  } catch (err) {
//    res.status(500).json({ message: err.message });
//  }
//};
//
// Export Voters to CSV
//export const exportVotersToCSV = async (req, res) => {
//  const __filename = fileURLToPath(import.meta.url);
//  const __dirname = path.dirname(__filename);
//
//  try {
//    const voters = await Voter.find().limit(4000).lean();
//    if (!voters.length) {
//      return res.status(404).json({ message: "No voter data found" });
//    }
//
//    const date = new Date();
//    const minutes = String(date.getMinutes()).padStart(2, "0");
//    const hours = String(date.getHours()).padStart(2, "0");
//    const day = String(date.getDate()).padStart(2, "0");
//    const month = String(date.getMonth() + 1).padStart(2, "0");
//    const year = date.getFullYear();
//    const fileName = `${minutes}_${hours}_${day}_${month}_${year}.csv`;
//    const filePath = path.join(__dirname, "..", "temp", fileName);
//
//    await fs.mkdir(path.join(__dirname, "..", "temp"), { recursive: true });
//
//    const csvWriter = createObjectCsvWriter({
//      path: filePath,
//      header: [
//        { id: "voterId", title: "Voter ID" },
//        { id: "fullName", title: "Full Name" },
//        { id: "firstName", title: "First Name" },
//        { id: "lastName", title: "Last Name" },
//        { id: "relativeName", title: "Relative Name" },
//        { id: "houseNo", title: "House Number" },
//        { id: "addressLine1", title: "Address Line 1" },
//        { id: "addressLine2", title: "Address Line 2" },
//        { id: "gender", title: "Gender" },
//        { id: "age", title: "Age" },
//        { id: "mobileNumber", title: "Mobile Number" },
//        { id: "caste", title: "Caste" },
//        { id: "sectionDetails", title: "Section Details" },
//        { id: "yadiNumber", title: "Yadi Number" },
//        { id: "assemblyConstituencyNumber", title: "Assembly Constituency Number" },
//        { id: "assemblyConstituencyName", title: "Assembly Constituency Name" },
//        { id: "assemblyReservationStatus", title: "Assembly Reservation Status" },
//        { id: "lokSabhaConstituencyNumber", title: "Lok Sabha Constituency Number" },
//        { id: "lokSabhaConstituencyName", title: "Lok Sabha Constituency Name" },
//        { id: "lokSabhaReservationStatus", title: "Lok Sabha Reservation Status" },
//        { id: "hometown", title: "Hometown" },
//        { id: "policeStation", title: "Police Station" },
//        { id: "taluka", title: "Taluka" },
//        { id: "district", title: "District" },
//        { id: "pinCode", title: "Pin Code" },
//      ],
//    });
//
//    await csvWriter.writeRecords(voters);
//    res.download(filePath, fileName, async (err) => {
//      if (err) {
//        console.error("Error sending file:", err);
//        return res.status(500).json({ message: "Error sending file" });
//      }
//      try {
//        await fs.unlink(filePath);
//      } catch (error) {
//        console.error("Error deleting file:", error);
//      }
//    });
//  } catch (error) {
//    console.error("Error exporting voters to CSV:", error);
//    res.status(500).json({ message: "Server error" });
//  }
//};
//
// Search Voters with Filters
//export const searchVoters = async (req, res) => {
//  try {
//    const filters = {};
//    const allowedFilters = [
//      "fullName",
//      "gender",
//      "age",
//      "caste",
//      "district",
//      "assemblyConstituencyName",
//      "lokSabhaConstituencyName",
//    ];
//    for (const key of allowedFilters) {
//      if (req.query[key]) {
//        filters[key] = new RegExp(req.query[key], "i");
//      }
//    }
//
//    const page = parseInt(req.query.page) || 1;
//    const limit = 25;
//    const voters = await Voter.find(filters)
//      .skip((page - 1) * limit)
//      .limit(limit);
//    const total = await Voter.countDocuments(filters);
//
//    res.status(200).json({
//      total,
//      page,
//      totalPages: Math.ceil(total / limit),
//      data: voters,
//    });
//  } catch (err) {
//    res.status(500).json({ message: err.message });
//  }
//};
//
// Get Voter Stats
//export const getVoterStats = async (req, res) => {
//  try {
//    const stats = {};
//
//    const totalVotersPromise = Voter.countDocuments();
//    const genderDistributionPromise = Voter.aggregate([
//      { $group: { _id: "$gender", count: { $sum: 1 } } },
//    ]);
//    const ageGroupDistributionPromise = Voter.aggregate([
//      {
//        $bucket: {
//          groupBy: "$age",
//          boundaries: [18, 25, 35, 45, 55, 65, Infinity],
//          default: "Other",
//          output: { count: { $sum: 1 } },
//        },
//      },
//      { $sort: { _id: 1 } },
//    ]);
//    const ageStatisticsPromise = Voter.aggregate([
//      {
//        $group: {
//          _id: null,
//          averageAge: { $avg: "$age" },
//          minAge: { $min: "$age" },
//          maxAge: { $max: "$age" },
//          stdDevAge: { $stdDevPop: "$age" },
//        },
//      },
//      { $project: { _id: 0 } },
//    ]);
//    const districtDistributionPromise = Voter.aggregate([
//      { $group: { _id: "$district", count: { $sum: 1 } } },
//      { $sort: { count: -1 } },
//    ]);
//    const assemblyConstituencyDistributionPromise = Voter.aggregate([
//      { $group: { _id: "$assemblyConstituencyName", count: { $sum: 1 } } },
//      { $sort: { count: -1 } },
//    ]);
//    const lokSabhaConstituencyDistributionPromise = Voter.aggregate([
//      { $group: { _id: "$lokSabhaConstituencyName", count: { $sum: 1 } } },
//      { $sort: { count: -1 } },
//    ]);
//    const missingHouseNoPromise = Voter.countDocuments({ houseNo: "Missing" });
//    const missingAddressLine1Promise = Voter.countDocuments({ addressLine1: "Missing" });
//    const missingAddressLine2Promise = Voter.countDocuments({ addressLine2: "Missing" });
//    const missingMobileNumberPromise = Voter.countDocuments({ mobileNumber: "Missing" });
//    const missingCastePromise = Voter.countDocuments({ caste: "Missing" });
//
//    const [
//      totalVoters,
//      genderDistribution,
//      ageGroupDistribution,
//      ageStatistics,
//      districtDistribution,
//      assemblyConstituencyDistribution,
//      lokSabhaConstituencyDistribution,
//      missingHouseNo,
//      missingAddressLine1,
//      missingAddressLine2,
//      missingMobileNumber,
//      missingCaste,
//    ] = await Promise.all([
//      totalVotersPromise,
//      genderDistributionPromise,
//      ageGroupDistributionPromise,
//      ageStatisticsPromise,
//      districtDistributionPromise,
//      assemblyConstituencyDistributionPromise,
//      lokSabhaConstituencyDistributionPromise,
//      missingHouseNoPromise,
//      missingAddressLine1Promise,
//      missingAddressLine2Promise,
//      missingMobileNumberPromise,
//      missingCastePromise,
//    ]);
//
//    stats.totalVoters = totalVoters;
//    stats.genderDistribution = genderDistribution;
//    stats.ageGroupDistribution = ageGroupDistribution;
//    stats.ageStatistics = ageStatistics[0] || {};
//    stats.geographicalDistribution = {
//      district: districtDistribution,
//      assemblyConstituency: assemblyConstituencyDistribution,
//      lokSabhaConstituency: lokSabhaConstituencyDistribution,
//    };
//    stats.missingDataCounts = {
//      houseNo: missingHouseNo,
//      addressLine1: missingAddressLine1,
//      addressLine2: missingAddressLine2,
//      mobileNumber: missingMobileNumber,
//      caste: missingCaste,
//    };
//    stats.missingDataPercentages = {
//      houseNo: ((missingHouseNo / totalVoters) * 100).toFixed(2),
//      addressLine1: ((missingAddressLine1 / totalVoters) * 100).toFixed(2),
//      addressLine2: ((missingAddressLine2 / totalVoters) * 100).toFixed(2),
//      mobileNumber: ((missingMobileNumber / totalVoters) * 100).toFixed(2),
//      caste: ((missingCaste / totalVoters) * 100).toFixed(2),
//    };
//
//    res.status(200).json({ success: true, data: stats });
//  } catch (error) {
//    console.error("Error fetching voter stats:", error);
//    res.status(500).json({ success: false, message: "Server error", error: error.message });
//  }
//};
