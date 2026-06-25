// backend/src/controllers/profileController.js
import profileService from '../services/profileService.js';

/**
 * getMyProfile
 * GET /api/profile/me
 * Returns the authenticated user's own profile.
 */
async function getMyProfile(req, res) {
  try {
    const profile = await profileService.getProfileById(req.user.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * updateMyProfile
 * PUT /api/profile/me
 * Updates name / phone / avatar_url for the authenticated user.
 */
async function updateMyProfile(req, res) {
  try {
    const { name, phone, avatar_url } = req.body;
    const updated = await profileService.updateProfile(req.user.id, {
      name,
      phone,
      avatar_url,
    });
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * changeMyPassword
 * POST /api/profile/change-password
 * Verifies the current password, then updates to the new one.
 */
async function changeMyPassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    const isValid = await profileService.verifyCurrentPassword(
      req.user.email,
      currentPassword
    );

    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    await profileService.changePassword(req.user.id, newPassword);
    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export { getMyProfile, updateMyProfile, changeMyPassword };