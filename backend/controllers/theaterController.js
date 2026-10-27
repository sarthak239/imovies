const Theatre = require('../models/theatreModel');
const store = require('../config/store');

// @desc    Get all theatres
// @route   GET /api/theatre or /api/theaters
// @access  Public
const getAllTheaters = async (req, res, next) => {
  try {
    const { location } = req.query;
    let theatres = [];

    try {
      let query = {};
      if (location) {
        query.location = { $regex: location, $options: 'i' };
      }
      theatres = await Theatre.find(query).sort({ createdAt: -1 });
    } catch (e) {
      theatres = store.theatres.filter(t => {
        return !location || (t.location && t.location.toLowerCase().includes(location.toLowerCase()));
      });
    }

    if (!theatres || theatres.length === 0) {
      theatres = store.theatres;
    }

    const normalized = theatres.map(t => {
      const obj = t.toObject ? t.toObject() : { ...t };
      obj.theatreName = obj.theatreName || obj.name;
      obj.name = obj.theatreName;
      return obj;
    });

    return res.json({
      success: true,
      count: normalized.length,
      theatres: normalized,
      theaters: normalized,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get theatre by ID
// @route   GET /api/theatre/:id
// @access  Public
const getTheaterById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let theatre = null;

    try {
      theatre = await Theatre.findById(id);
    } catch (e) {
      theatre = store.theatres.find(t => t._id === id || String(t._id) === String(id));
    }

    if (!theatre) {
      theatre = store.theatres.find(t => t._id === id || String(t._id) === String(id));
    }

    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found' });
    }

    const obj = theatre.toObject ? theatre.toObject() : { ...theatre };
    obj.theatreName = obj.theatreName || obj.name;
    obj.name = obj.theatreName;

    return res.json({
      success: true,
      theatre: obj,
      theater: obj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new theatre
// @route   POST /api/theatre
// @access  Private/Admin
const createTheater = async (req, res, next) => {
  try {
    const {
      theatreName,
      name,
      location,
      balconySeatPrice,
      middleSeatPrice,
      lowerSeatPrice,
      balconySeats,
      middleSeats,
      lowerSeats,
      facilities,
    } = req.body;

    const tName = (theatreName || name || '').trim();
    if (!tName || !location) {
      return res.status(400).json({ success: false, message: 'Theatre name and location are required' });
    }

    const bPrice = Number(balconySeatPrice) || 280;
    const mPrice = Number(middleSeatPrice) || 200;
    const lPrice = Number(lowerSeatPrice) || 140;

    let theatre = null;
    try {
      theatre = await Theatre.create({
        theatreName: tName,
        location,
        balconySeatPrice: bPrice,
        middleSeatPrice: mPrice,
        lowerSeatPrice: lPrice,
        balconySeats: balconySeats || { rows: 2, cols: 10, total: 20 },
        middleSeats: middleSeats || { rows: 3, cols: 10, total: 30 },
        lowerSeats: lowerSeats || { rows: 2, cols: 10, total: 20 },
        facilities: facilities || ['Dolby Atmos', '4K Laser Projection', 'Recliners'],
      });
    } catch (e) {
      theatre = {
        _id: 'th_' + Date.now(),
        theatreName: tName,
        name: tName,
        location,
        balconySeatPrice: bPrice,
        middleSeatPrice: mPrice,
        lowerSeatPrice: lPrice,
        balconySeats: balconySeats || { rows: 2, cols: 10, total: 20 },
        middleSeats: middleSeats || { rows: 3, cols: 10, total: 30 },
        lowerSeats: lowerSeats || { rows: 2, cols: 10, total: 20 },
        facilities: facilities || ['Dolby Atmos', '4K Laser Projection', 'Recliners'],
        createdAt: new Date(),
      };
      store.theatres.push(theatre);
    }

    return res.status(201).json({
      success: true,
      message: 'Theatre created successfully',
      theatre,
      theater: theatre,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update theatre
// @route   PUT /api/theatre/:id
// @access  Private/Admin
const updateTheater = async (req, res, next) => {
  try {
    const { id } = req.params;
    let theatre = null;
    try {
      theatre = await Theatre.findByIdAndUpdate(id, req.body, { new: true });
    } catch (e) {
      const idx = store.theatres.findIndex(t => t._id === id);
      if (idx !== -1) {
        store.theatres[idx] = { ...store.theatres[idx], ...req.body };
        theatre = store.theatres[idx];
      }
    }

    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found' });
    }

    return res.json({ success: true, message: 'Theatre updated', theatre });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete theatre
// @route   DELETE /api/theatre/:id
// @access  Private/Admin
const deleteTheater = async (req, res, next) => {
  try {
    const { id } = req.params;
    try {
      await Theatre.findByIdAndDelete(id);
    } catch (e) {
      store.theatres = store.theatres.filter(t => t._id !== id);
    }
    return res.json({ success: true, message: 'Theatre deleted' });
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
