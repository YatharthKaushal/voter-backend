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

// Pagination Function (25 per page)
export const paginateVoters = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 25;
  try {
    const voters = await Voter.find()
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Voter.countDocuments();
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

// Bulk Import
export const bulkImportVoters = async (req, res) => {
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
