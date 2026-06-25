import express from "express";
import {
  getAllTickets,
  updateTicketStatus,
} from "../controllers/ticketCtrl.js";

const router = express.Router();

router.get("/", getAllTickets);

router.patch("/:id/status", updateTicketStatus);

export default router;