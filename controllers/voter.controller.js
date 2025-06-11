import Voter from "../models/VoterModel.js";

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
    const updated = await Voter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
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

// // Pagination Function (25 per page)
// export const paginateVoters = async (req, res) => {
//   const page = parseInt(req.query.page) || 1;
//   const limit = 25;
//   try {
//     const voters = await Voter.find()
//       .skip((page - 1) * limit)
//       .limit(limit);
//     const total = await Voter.countDocuments();
//     res.status(200).json({
//       total,
//       page,
//       totalPages: Math.ceil(total / limit),
//       data: voters,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// Pagination Function (25 per page)
export const paginateVoters = async (req, res) => {
  console.log("> reached paginateVoters controller");
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;

  if (page < 1 || limit < 1) {
    console.log("> Invalid page or limit parameters:", { page, limit });
    return res
      .status(400)
      .json({ message: "Invalid page or limit parameters" });
  }

  try {
    const voters = await Voter.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(); // Improve performance by converting to plain JS object
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

// Bulk Import
export const bulkImportVoters = async (req, res) => {
  // console.log("> reached bulkImportVoters controller");
  // console.log("> Request body:", req.body); // Log the request body for debugging
  try {
    const voters = req.body; // expects array
    if (!Array.isArray(voters)) {
      return res.status(400).json({ message: "Invalid input format" });
    }
    const inserted = await Voter.insertMany(voters);
    res.status(201).json(inserted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Bulk Export
export const bulkExportVoters = async (req, res) => {
  console.log("> reached bulkExportVoters controller");
  try {
    const voters = await Voter.find();
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=voters.json");
    res.status(200).send(JSON.stringify(voters, null, 2));
  } catch (err) {
    res.status(500).json({ message: err.message });
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

export const getVoterStats = async (req, res) => {
  try {
    const stats = {};

    // 1. Total Voter Count
    const totalVotersPromise = Voter.countDocuments({});

    // 2. Gender Distribution
    const genderDistributionPromise = Voter.aggregate([
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 },
        },
      },
    ]);

    // 3. Age Distribution (by range)
    const ageGroupDistributionPromise = Voter.aggregate([
      {
        $bucket: {
          groupBy: "$age",
          boundaries: [18, 25, 35, 45, 55, 65, Infinity], // Define your age ranges
          default: "Other",
          output: {
            count: { $sum: 1 },
          },
        },
      },
      { $sort: { _id: 1 } }, // Sort by age group
    ]);

    // 4. Age Statistics (Min, Max, Avg, StdDev)
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
      { $project: { _id: 0 } }, // Exclude _id from result
    ]);

    // 5. District Distribution
    const districtDistributionPromise = Voter.aggregate([
      {
        $group: {
          _id: "$district",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } }, // Sort by count (descending)
    ]);

    // 6. Assembly Constituency Distribution
    const assemblyConstituencyDistributionPromise = Voter.aggregate([
      {
        $group: {
          _id: "$assemblyConstituencyName",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 7. Lok Sabha Constituency Distribution
    const lokSabhaConstituencyDistributionPromise = Voter.aggregate([
      {
        $group: {
          _id: "$lokSabhaConstituencyName",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 8. Missing Data Counts
    const missingHouseNoPromise = Voter.countDocuments({ houseNo: "Missing" });
    const missingAddressLine1Promise = Voter.countDocuments({
      addressLine1: "Missing",
    });
    const missingAddressLine2Promise = Voter.countDocuments({
      addressLine2: "Missing",
    });
    const missingMobileNumberPromise = Voter.countDocuments({
      mobileNumber: "Missing",
    });
    const missingCastePromise = Voter.countDocuments({ caste: "Missing" });

    // Execute all promises concurrently
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

    // Organize results into the stats object
    stats.totalVoters = totalVoters;
    stats.genderDistribution = genderDistribution;
    stats.ageGroupDistribution = ageGroupDistribution;
    stats.ageStatistics = ageStatistics[0] || {}; // ageStatistics returns an array, take the first element
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
    // Calculate percentages for missing data
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
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
