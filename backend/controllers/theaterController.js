const Theater = require('../models/Theater');
const Show = require('../models/Show');

// @desc    Get all theaters (with optional city filter)
// @route   GET /api/theaters
// @access  Public
const getAllTheaters = async (req, res, next) => {
  try {
    const { city, search } = req.query;
    let query = { isActive: true };

    if (city && city !== 'All') {
      query.city = new RegExp(`^${city}$`, 'i');
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const theaters = await Theater.find(query).sort({ city: 1, name: 1 });

    // Distinct cities for filter dropdowns
    const cities = await Theater.distinct('city', { isActive: true });

    return res.json({
      success: true,
      count: theaters.length,
      cities,
      theaters,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get theater by ID
// @route   GET /api/theaters/:id
// @access  Public
const getTheaterById = async (req, res, next) => {
  try {
    const theater = await Theater.findById(req.params.id);
    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found',
      });
    }

    return res.json({
      success: true,
      theater,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a theater
// @route   POST /api/theaters
// @access  Private/Admin
const createTheater = async (req, res, next) => {
  try {
    const { name, location, city, address, facilities, screens } = req.body;

    const theater = await Theater.create({
      name,
      location,
      city,
      address,
      facilities: Array.isArray(facilities)
        ? facilities
        : facilities
        ? facilities.split(',').map((f) => f.trim())
        : ['Dolby Atmos', '4K Projection', 'Food Court'],
      screens: screens && screens.length > 0 ? screens : [{ name: 'Screen 1', totalSeats: 60 }],
    });

    return res.status(201).json({
      success: true,
      message: 'Theater created successfully',
      theater,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a theater
// @route   PUT /api/theaters/:id
// @access  Private/Admin
const updateTheater = async (req, res, next) => {
  try {
    let theater = await Theater.findById(req.params.id);
    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found',
      });
    }

    const updateData = { ...req.body };
    if (updateData.facilities && typeof updateData.facilities === 'string') {
      updateData.facilities = updateData.facilities.split(',').map((f) => f.trim());
    }

    theater = await Theater.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.json({
      success: true,
      message: 'Theater updated successfully',
      theater,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a theater
// @route   DELETE /api/theaters/:id
// @access  Private/Admin
const deleteTheater = async (req, res, next) => {
  try {
    const theater = await Theater.findById(req.params.id);
    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found',
      });
    }

    // Delete associated shows
    await Show.deleteMany({ theater: theater._id });

    await theater.deleteOne();

    return res.json({
      success: true,
      message: 'Theater and associated shows deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTheaters,
  getTheaterById,
  createTheater,
  updateTheater,
  deleteTheater,
};
