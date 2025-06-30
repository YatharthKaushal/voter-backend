import express from "express";
import {
  createVoter,
  getVoterById,
  updateVoter,
  deleteVoter,
  paginateVoters,
  bulkImportVoters,
  bulkExportVoters,
  searchVoters,
  getVotersByVoterId,
  getVoterStats,
  allVoters,
  exportVotersToCSV,
  bulkImportVotersCSV,
} from "../controllers/voter.controller.js";
import { verifyAdminToken } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// Protect all routes with admin auth middleware
//router.use(verifyAdminToken);

/**
 * @route POST /api/voters/create
 * @desc Create a new voter
 * @access Private (requires admin authentication via JWT)
 */
router.post("/create", createVoter);

/**
 * @route GET /api/voters/get/:id
 * @desc Get a voter by ID
 * @access Private (requires admin authentication via JWT)
 */
router.get("/get/:id", getVoterById);

/**
 * @route PUT /api/voters/update/:id
 * @desc Update a voter by ID
 * @access Private (requires admin authentication via JWT)
 */
router.put("/update/:id", updateVoter);

/**
 * @route DELETE /api/voters/delete/:id
 * @desc Delete a voter by ID
 * @access Private (requires admin authentication via JWT)
 */
router.delete("/delete/:id", deleteVoter);

/**
 * @route GET /api/voters
 * @desc Get paginated list of voters (25 per page)
 * @access Private (requires admin authentication via JWT)
 */
router.get("/", paginateVoters);

/**
 * @route GET /api/voters/all
 * @desc Get full list of voters
 * @access Private (requires admin authentication via JWT)
 */
router.get("/all", allVoters);

/**
 * @route GET /api/voters/search
 * @desc Search voters with filters (paginated)
 * @access Private (requires admin authentication via JWT)
 */
router.get("/search", searchVoters);

/**
 * @route POST /api/voters/import
 * @desc Bulk import voters from JSON
 * @access Private (requires admin authentication via JWT)
 */
router.post("/import", bulkImportVoters);

/**
 * @route POST /api/voters/import-csv
 * @desc Bulk import voters from CSV
 * @access Private (requires admin authentication via JWT)
 */
router.post("/import-csv", bulkImportVotersCSV);

/**
 * @route GET /api/voters/export
 * @desc Bulk export all voters as JSON file
 * @access Private (requires admin authentication via JWT)
 */
router.get("/export", bulkExportVoters);

/**
 * @route GET /api/voters/voterId/:voterId
 * @desc Get voters by voterId
 * @access Private (requires admin authentication via JWT)
 */
router.get("/voterId/:voterId", getVotersByVoterId);

/**
 * @route GET /api/voters/stats
 * @desc Get voter statistics
 * @access Private (requires admin authentication via JWT)
 */
router.get("/stats", getVoterStats);

/**
 * @route GET /api/voters/getCSV
 * @desc Export voter data to CSV (up to 4000 records)
 * @access Public
 */
router.get("/getCSV", exportVotersToCSV);

export default router;
