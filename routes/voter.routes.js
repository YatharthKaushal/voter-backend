// File: routes/voter.routes.js

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
} from "../controllers/voter.controller.js";
import { verifyAdminToken } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// Protect all routes with admin auth middleware
//router.use(verifyAdminToken);

/**
 * @route POST /api/voters/
 * @desc Create a new voter
 * @access Private (requires admin authentication via JWT)
 */
router.post("create/", createVoter);

/**
 * @route GET /api/voters/voters/:id
 * @desc Get a voter by ID
 * @access Private (requires admin authentication via JWT)
 */
router.get("get/:id", getVoterById);

/**
 * @route PUT /api/voters/voters/:id
 * @desc Update a voter by ID
 * @access Private (requires admin authentication via JWT)
 */
router.put("update/:id", updateVoter);

/**
 * @route DELETE /api/voters/voters/:id
 * @desc Delete a voter by ID
 * @access Private (requires admin authentication via JWT)
 */
router.delete("delete/:id", deleteVoter);

/**
 * @route GET /api/voters
 * @desc Get paginated list of voters (25 per page)
 * @access Private (requires admin authentication via JWT)
 */
router.get("/", paginateVoters);

/**
 * @route GET /api/voters/voters/search
 * @desc Search voters with filters (paginated)
 * @access Private (requires admin authentication via JWT)
 */
router.get("/voters/search", searchVoters);

/**
 * @route POST /api/voters/voters/import
 * @desc Bulk import voters from JSON
 * @access Private (requires admin authentication via JWT)
 */
router.post("/import", bulkImportVoters);

/**
 * @route GET /api/voters/voters/export
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

export default router;
