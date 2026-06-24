const supabase = require('../db/supabase')

async function getAllTickets(req, res) {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}

async function updateTicketStatus(req, res) {
  const { id } = req.params
  const { status } = req.body

  const allowed = ['open', 'in_progress', 'resolved', 'closed']
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' })
  }

  const { data, error } = await supabase
    .from('tickets')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}

module.exports = { getAllTickets, updateTicketStatus }