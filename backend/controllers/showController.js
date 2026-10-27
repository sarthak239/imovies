const Show = require('../models/showModel');
const Movie = require('../models/movieModel');
const Theatre = require('../models/theatreModel');
const store = require('../config/store');

// Helper to generate seat tickets object with tier layout
const generateTicketMatrix = (bPrice = 280, mPrice = 200, lPrice = 140) => {
  const tickets = {};

  // Balcony (Rows A, B - 10 cols)
  ['A', 'B'].forEach((row) => {
    for (let c = 1; c <= 10; c++) {
      const seatNumber = `${row}${c}`;
      tickets[seatNumber] = {
        seatNumber,
        tier: 'Balcony',
        price: bPrice,
        status: 'available', // available | locked | booked
        lockedBy: null,
        lockExpiresAt: null,
      };
    }
  });

  // Middle (Rows C, D, E - 10 cols)
  ['C', 'D', 'E'].forEach((row) => {
    for (let c = 1; c <= 10; c++) {
      const seatNumber = `${row}${c}`;
      tickets[seatNumber] = {
        seatNumber,
        tier: 'Middle',
        price: mPrice,
        status: 'available',
        lockedBy: null,
        lockExpiresAt: null,
      };
    }
  });

  // Lower (Rows F, G - 10 cols)
  ['F', 'G'].forEach((row) => {
    for (let c = 1; c <= 10; c++) {
      const seatNumber = `${row}${c}`;
      tickets[seatNumber] = {
        seatNumber,
        tier: 'Lower',
        price: lPrice,
        status: 'available',
        lockedBy: null,
        lockExpiresAt: null,
      };
    }
  });

  return tickets;
};

// Auto-clean expired seat locks on a show object
const cleanShowSeatLocks = (show) => {
  if (!show || !show.tickets) return;
  const now = Date.now();
  Object.values(show.tickets).forEach((seat) => {
    if (seat.status === 'locked' && seat.lockExpiresAt) {
      const exp = new Date(seat.lockExpiresAt).getTime();
      if (now > exp) {
        seat.status = 'available';
        seat.lockedBy = null;
        seat.lockExpiresAt = null;
      }
    }
  });
};

// @desc    Get all shows with filters (movieId, theatreName, date)
// @route   GET /api/shows
// @access  Public
const getAllShows = async (req, res, next) => {
  try {
    const { movie, movieId, theatreName, date, showDate } = req.query;
    const targetMovieId = movieId || movie;
    const targetDate = showDate || date;

    let shows = [];
    try {
      let query = { isActive: true };
      if (targetMovieId) {
        query.$or = [{ movieId: targetMovieId }, { movie: targetMovieId }];
      }
      if (theatreName) {
        query.theatreName = { $regex: theatreName, $options: 'i' };
      }
      shows = await Show.find(query).sort({ showDate: 1, showTime: 1 });
    } catch (e) {
      shows = store.shows.filter((s) => {
        const mMatch = !targetMovieId || String(s.movieId) === String(targetMovieId) || String(s.movie) === String(targetMovieId);
        const tMatch = !theatreName || (s.theatreName && s.theatreName.toLowerCase().includes(theatreName.toLowerCase()));
        return s.isActive && mMatch && tMatch;
      });
    }

    if ((!shows || shows.length === 0) && targetMovieId) {
      // Auto-schedule shows on-demand for this live market movie across theatres
      let movieTitle = 'Live Market Release';
      const mInStore = store.movies.find((m) => String(m._id) === String(targetMovieId) || String(m.tmdbId) === String(targetMovieId));
      if (mInStore) {
        movieTitle = mInStore.movieName || mInStore.title;
      } else {
        try {
          const tmdbService = require('../services/tmdbService');
          const tmdbDetails = await tmdbService.getMovieDetails(targetMovieId);
          if (tmdbDetails) {
            movieTitle = tmdbDetails.movieName || tmdbDetails.title;
            store.movies.push(tmdbDetails);
          }
        } catch (e) {}
      }

      const showTimes = ['10:30 AM', '01:45 PM', '05:15 PM', '08:30 PM', '11:00 PM'];
      const today = new Date();
      const dates = [0, 1, 2, 3, 4].map((offset) => {
        const d = new Date(today);
        d.setDate(d.getDate() + offset);
        return d;
      });

      const autoShows = [];
      const venues = store.theatres && store.theatres.length > 0 ? store.theatres : [
        {
          _id: 'th_1',
          theatreName: 'PVR Prime IMAX: Downtown Hub',
          location: 'Downtown Boulevard, Metro Centre',
          balconySeatPrice: 320,
          middleSeatPrice: 240,
          lowerSeatPrice: 160,
          facilities: ['IMAX 4K Laser', 'Dolby Atmos 7.1', 'Prime Recliners'],
        },
        {
          _id: 'th_2',
          theatreName: 'Cinepolis VIP Cinema: Royal Galleria',
          location: 'Royal Galleria, Sector 18',
          balconySeatPrice: 350,
          middleSeatPrice: 260,
          lowerSeatPrice: 180,
          facilities: ['Dolby Atmos', 'In-Seat Waiter Service', 'Plush Luxury Recliners'],
        },
        {
          _id: 'th_3',
          theatreName: 'AMC Prime: Nexus MegaMall',
          location: 'Nexus Boulevard, North Avenue',
          balconySeatPrice: 290,
          middleSeatPrice: 210,
          lowerSeatPrice: 150,
          facilities: ['4DX Motion', 'Dolby Cinema', 'Laser Projection'],
        },
      ];

      venues.forEach((theatre, tIdx) => {
        dates.forEach((dObj, dIdx) => {
          const times = [showTimes[(tIdx + dIdx) % showTimes.length], showTimes[(tIdx + dIdx + 2) % showTimes.length]];
          times.forEach((time) => {
            const tickets = generateTicketMatrix(
              theatre.balconySeatPrice || 280,
              theatre.middleSeatPrice || 200,
              theatre.lowerSeatPrice || 140
            );
            // Pre-reserve a couple seats for realism
            if (tickets['C4']) tickets['C4'].status = 'booked';
            if (tickets['C5']) tickets['C5'].status = 'booked';

            const sDoc = {
              _id: `auto_${targetMovieId}_${tIdx}_${dIdx}_${time.replace(/[: ]/g, '')}`,
              showId: `SHW-${Math.floor(1000 + Math.random() * 9000)}`,
              adminEmail: 'admin@imovies.com',
              movieId: targetMovieId,
              movieName: movieTitle,
              theatreName: theatre.theatreName,
              theatreId: theatre._id,
              showDate: dObj,
              showTime: time,
              tierPricing: {
                balcony: theatre.balconySeatPrice || 280,
                middle: theatre.middleSeatPrice || 200,
                lower: theatre.lowerSeatPrice || 140,
              },
              tickets,
              isActive: true,
              createdAt: new Date(),
            };

            autoShows.push(sDoc);
            store.shows.push(sDoc);
          });
        });
      });

      // Try inserting into MongoDB as well
      try {
        await Show.insertMany(autoShows, { ordered: false });
      } catch (e) {}

      shows = autoShows;
    }

    // Clean expired locks and calculate available counts
    const normalizedShows = shows.map((s) => {
      const obj = s.toObject ? s.toObject() : { ...s };
      cleanShowSeatLocks(obj);

      const ticketList = obj.tickets ? Object.values(obj.tickets) : [];
      const totalSeats = ticketList.length || 70;
      const availableSeats = ticketList.filter(t => t.status === 'available').length;

      // Populate movie and theatre metadata if missing
      const foundMovie = store.movies.find(m => String(m._id) === String(obj.movieId));
      const foundTheatre = store.theatres.find(t => t.theatreName === obj.theatreName || String(t._id) === String(obj.theatreId));

      return {
        ...obj,
        id: obj._id,
        movie: foundMovie || { title: obj.movieName, posterUrl: '' },
        theatre: foundTheatre || { theatreName: obj.theatreName, location: 'Prime Cinema' },
        theater: foundTheatre || { theatreName: obj.theatreName, name: obj.theatreName, location: 'Prime Cinema' },
        totalSeats,
        availableSeats,
      };
    });

    return res.json({
      success: true,
      count: normalizedShows.length,
      shows: normalizedShows,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get show by ID (with seat tickets map)
// @route   GET /api/shows/:id
// @access  Public
const getShowById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let show = null;

    try {
      show = await Show.findById(id);
      if (!show) {
        show = await Show.findOne({ showId: id });
      }
    } catch (e) {
      show = store.shows.find(s => s._id === id || s.showId === id);
    }

    if (!show) {
      show = store.shows.find(s => s._id === id || s.showId === id);
    }

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    const obj = show.toObject ? show.toObject() : { ...show };
    cleanShowSeatLocks(obj);

    const foundMovie = store.movies.find(m => String(m._id) === String(obj.movieId));
    const foundTheatre = store.theatres.find(t => t.theatreName === obj.theatreName || String(t._id) === String(obj.theatreId));

    obj.movie = foundMovie || { movieName: obj.movieName, title: obj.movieName };
    obj.theatre = foundTheatre || { theatreName: obj.theatreName };
    obj.theater = obj.theatre;

    return res.json({
      success: true,
      show: obj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new show
// @route   POST /api/shows
// @access  Private/Admin
const createShow = async (req, res, next) => {
  try {
    const {
      adminEmail,
      showId,
      movieId,
      theatreName,
      showDate,
      showTime,
      tierPricing,
      tickets,
    } = req.body;

    if (!movieId || !theatreName || !showDate || !showTime) {
      return res.status(400).json({
        success: false,
        message: 'Movie, theatre name, show date, and show time are required',
      });
    }

    const sId = showId || 'SHW-' + Math.floor(100 + Math.random() * 900);
    const email = adminEmail || req.user?.email || 'admin@imovies.com';

    const pricing = tierPricing || { balcony: 280, middle: 200, lower: 140 };
    const ticketsMatrix = tickets && Object.keys(tickets).length > 0
      ? tickets
      : generateTicketMatrix(pricing.balcony, pricing.middle, pricing.lower);

    // Get movie name
    const m = store.movies.find(x => String(x._id) === String(movieId));
    const mName = m ? (m.movieName || m.title) : 'Blockbuster Movie';

    let show = null;
    try {
      show = await Show.create({
        adminEmail: email,
        showId: sId,
        movieId,
        movieName: mName,
        theatreName,
        showDate: new Date(showDate),
        showTime,
        tierPricing: pricing,
        tickets: ticketsMatrix,
        isActive: true,
      });
    } catch (e) {
      show = {
        _id: 'show_' + Date.now(),
        showId: sId,
        adminEmail: email,
        movieId,
        movieName: mName,
        theatreName,
        showDate: new Date(showDate),
        showTime,
        tierPricing: pricing,
        tickets: ticketsMatrix,
        isActive: true,
        createdAt: new Date(),
      };
      store.shows.push(show);
    }

    return res.status(201).json({
      success: true,
      message: 'Show scheduled successfully',
      show,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update show
// @route   PUT /api/shows/:id
// @access  Private/Admin
const updateShow = async (req, res, next) => {
  try {
    const { id } = req.params;
    let show = null;
    try {
      show = await Show.findByIdAndUpdate(id, req.body, { new: true });
    } catch (e) {
      const idx = store.shows.findIndex(s => s._id === id || s.showId === id);
      if (idx !== -1) {
        store.shows[idx] = { ...store.shows[idx], ...req.body };
        show = store.shows[idx];
      }
    }

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    return res.json({ success: true, message: 'Show updated', show });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete show
// @route   DELETE /api/shows/:id
// @access  Private/Admin
const deleteShow = async (req, res, next) => {
  try {
    const { id } = req.params;
    try {
      await Show.findByIdAndDelete(id);
    } catch (e) {
      store.shows = store.shows.filter(s => s._id !== id && s.showId !== id);
    }
    return res.json({ success: true, message: 'Show deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
  generateTicketMatrix,
  cleanShowSeatLocks,
};
