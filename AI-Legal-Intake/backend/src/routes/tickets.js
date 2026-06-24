const express = require('express')
const router = express.Router()
const { getAllTickets, updateTicketStatus } = require('../controllers/ticketCtrl')

router.get('/', getAllTickets)
router.patch('/:id/status', updateTicketStatus)

module.exports = router