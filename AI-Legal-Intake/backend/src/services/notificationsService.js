const { supabase } = require('../config/supabase');

/**
 * Creates a notification record in the notifications table.
 * Called internally by other services (ticket assignment, status change, etc.)
 */
async function createNotification({ userId, type, title, body, entityType, entityId }) {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,           // e.g. 'ticket_assigned', 'ticket_updated', 'intake_received'
      title,
      body,
      entity_type: entityType,  // e.g. 'ticket'
      entity_id: entityId,      // UUID of the related entity
      is_read: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Returns paginated notifications for a user.
 */
async function getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false }) {
  const offset = (page - 1) * limit;

  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (unreadOnly) query = query.eq('is_read', false);

  const { data, error, count } = await query;
  if (error) throw error;

  return { data, total: count, page, limit };
}

/**
 * Returns the unread notification count for a user.
 */
async function getUnreadCount(userId) {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
  return count;
}

/**
 * Marks one notification as read.
 */
async function markAsRead(notificationId, userId) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', userId)  // Row-level safety: users can only touch their own
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Marks ALL unread notifications for a user as read.
 */
async function markAllAsRead(userId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
}

/**
 * Deletes a notification (user's own only).
 */
async function deleteNotification(notificationId, userId) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', userId);

  if (error) throw error;
}

module.exports = {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};