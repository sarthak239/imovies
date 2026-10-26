const express = require('express');
const router = express.Router();
const {
  getAllShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
} = require('../controllers/showController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAllShows)
  .post(protect, admin, createShow);

router.route('/:id')
  .get(getShowById)
  .put(protect, admin, updateShow)
  .delete(protect, admin, deleteShow);

module.exports = router;
