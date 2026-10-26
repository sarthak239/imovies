const express = require('express');
const router = express.Router();
const {
  getAllTheaters,
  getTheaterById,
  createTheater,
  updateTheater,
  deleteTheater,
} = require('../controllers/theaterController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAllTheaters)
  .post(protect, admin, createTheater);

router.route('/:id')
  .get(getTheaterById)
  .put(protect, admin, updateTheater)
  .delete(protect, admin, deleteTheater);

module.exports = router;
