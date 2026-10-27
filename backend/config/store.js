/**
 * iMovies In-Memory & MongoDB Unified Persistence Engine
 * Supports seamless fallback if MongoDB service is not running locally.
 */

const bcrypt = require('bcryptjs');

class DataStore {
  constructor() {
    this.users = [];
    this.admins = [];
    this.movies = [];
    this.theatres = [];
    this.shows = [];
    this.bookings = [];
    this.favorites = [];
    this.reviews = [];
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;

    // Seed Admin
    const adminHashed = await bcrypt.hash('admin123', 10);
    this.admins.push({
      _id: 'admin_1',
      username: 'admin',
      email: 'admin@imovies.com',
      password: adminHashed,
      role: 'admin',
      isVerified: true,
      createdAt: new Date(),
    });

    // Seed User
    const userHashed = await bcrypt.hash('user123', 10);
    this.users.push({
      _id: 'user_1',
      username: 'prime_viewer',
      name: 'Prime Cinephile',
      email: 'user@imovies.com',
      password: userHashed,
      role: 'user',
      isVerified: true,
      createdAt: new Date(),
    });

    // Seed Movies with high-res Amazon Prime Video style backdrops
    this.movies = [
      {
        _id: 'mov_1',
        movieName: 'Dune: Part Two',
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.',
        genres: ['Action', 'Sci-Fi', 'Adventure', 'Drama'],
        genre: ['Action', 'Sci-Fi', 'Adventure', 'Drama'],
        releaseDate: new Date('2024-03-01'),
        language: 'English',
        duration: '2h 46m',
        certification: 'UA 16+',
        censorRating: 'UA 16+',
        rating: 8.8,
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w',
        cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem', 'Austin Butler'],
        featured: true,
        status: 'now_showing',
        createdAt: new Date(),
      },
      {
        _id: 'mov_2',
        movieName: 'Oppenheimer',
        title: 'Oppenheimer',
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring moral dilemmas and the dawn of the atomic age.',
        genres: ['Biography', 'Drama', 'History'],
        genre: ['Biography', 'Drama', 'History'],
        releaseDate: new Date('2023-07-21'),
        language: 'English',
        duration: '3h 00m',
        certification: 'A 18+',
        censorRating: 'A 18+',
        rating: 8.9,
        posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=800&auto=format&fit=crop',
        backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1600&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/embed/uYPbbksJxIg',
        cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh'],
        featured: true,
        status: 'now_showing',
        createdAt: new Date(),
      },
      {
        _id: 'mov_3',
        movieName: 'Interstellar',
        title: 'Interstellar',
        description: 'When Earth becomes uninhabitable, a former NASA pilot and a team of researchers embark on a mission through a newly discovered wormhole in search of a future home for humanity.',
        genres: ['Sci-Fi', 'Adventure', 'Drama'],
        genre: ['Sci-Fi', 'Adventure', 'Drama'],
        releaseDate: new Date('2014-11-07'),
        language: 'English',
        duration: '2h 49m',
        certification: 'UA 13+',
        censorRating: 'UA 13+',
        rating: 8.7,
        posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
        backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1600&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E',
        cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
        featured: true,
        status: 'now_showing',
        createdAt: new Date(),
      },
      {
        _id: 'mov_4',
        movieName: 'The Dark Knight',
        title: 'The Dark Knight',
        description: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',
        genres: ['Action', 'Crime', 'Drama', 'Thriller'],
        genre: ['Action', 'Crime', 'Drama', 'Thriller'],
        releaseDate: new Date('2008-07-18'),
        language: 'English',
        duration: '2h 32m',
        certification: 'UA 16+',
        censorRating: 'UA 16+',
        rating: 9.0,
        posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
        backdropUrl: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?q=80&w=1600&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/embed/EXeTwQWrcwY',
        cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Gary Oldman', 'Morgan Freeman'],
        featured: false,
        status: 'now_showing',
        createdAt: new Date(),
      },
      {
        _id: 'mov_5',
        movieName: 'Spider-Man: Across the Spider-Verse',
        title: 'Spider-Man: Across the Spider-Verse',
        description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash, Miles must redefine heroism.',
        genres: ['Animation', 'Action', 'Adventure', 'Sci-Fi'],
        genre: ['Animation', 'Action', 'Adventure', 'Sci-Fi'],
        releaseDate: new Date('2023-06-02'),
        language: 'English',
        duration: '2h 20m',
        certification: 'U',
        censorRating: 'U',
        rating: 8.7,
        posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=800&auto=format&fit=crop',
        backdropUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1600&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/embed/cqGjhVJWtEg',
        cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Daniel Kaluuya'],
        featured: false,
        status: 'now_showing',
        createdAt: new Date(),
      },
      {
        _id: 'mov_6',
        movieName: 'Gladiator II',
        title: 'Gladiator II',
        description: 'Years after witnessing the fall of Maximus, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who rule Rome with an iron fist.',
        genres: ['Action', 'Adventure', 'Drama'],
        genre: ['Action', 'Adventure', 'Drama'],
        releaseDate: new Date('2024-11-15'),
        language: 'English',
        duration: '2h 28m',
        certification: 'A 18+',
        censorRating: 'A 18+',
        rating: 8.3,
        posterUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/embed/4rgYUipGJNo',
        cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
        featured: false,
        status: 'now_showing',
        createdAt: new Date(),
      },
      {
        _id: 'mov_7',
        movieName: 'Avatar: Fire and Ash',
        title: 'Avatar: Fire and Ash',
        description: 'Jake Sully and Neytiri return to explore uncharted volcanic regions of Pandora and encounter hostile Na\'vi clans known as the Ash People in James Cameron\'s cinematic saga.',
        genres: ['Sci-Fi', 'Action', 'Adventure'],
        genre: ['Sci-Fi', 'Action', 'Adventure'],
        releaseDate: new Date('2025-12-19'),
        language: 'English',
        duration: '3h 10m',
        certification: 'UA 13+',
        censorRating: 'UA 13+',
        rating: 9.1,
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
        backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/embed/d9MyW72ELq0',
        cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Stephen Lang'],
        featured: true,
        status: 'upcoming',
        createdAt: new Date(),
      },
    ];

    // Seed Theatres
    this.theatres = [
      {
        _id: 'th_1',
        theatreName: 'PVR Prime IMAX: Downtown Hub',
        location: 'Downtown Boulevard, Metro Centre',
        balconySeatPrice: 320,
        middleSeatPrice: 240,
        lowerSeatPrice: 160,
        balconySeats: { rows: 2, cols: 10, total: 20 },
        middleSeats: { rows: 3, cols: 10, total: 30 },
        lowerSeats: { rows: 2, cols: 10, total: 20 },
        facilities: ['IMAX 4K Laser', 'Dolby Atmos 7.1', 'Prime Recliners', 'Gourmet Lounge'],
        createdAt: new Date(),
      },
      {
        _id: 'th_2',
        theatreName: 'Cinepolis VIP Cinema: Royal Galleria',
        location: 'Royal Galleria, Sector 18',
        balconySeatPrice: 350,
        middleSeatPrice: 260,
        lowerSeatPrice: 180,
        balconySeats: { rows: 2, cols: 10, total: 20 },
        middleSeats: { rows: 3, cols: 10, total: 30 },
        lowerSeats: { rows: 2, cols: 10, total: 20 },
        facilities: ['Dolby Atmos', 'In-Seat Waiter Service', 'Plush Luxury Recliners'],
        createdAt: new Date(),
      },
      {
        _id: 'th_3',
        theatreName: 'AMC Prime: Nexus MegaMall',
        location: 'Nexus Boulevard, North Avenue',
        balconySeatPrice: 290,
        middleSeatPrice: 210,
        lowerSeatPrice: 150,
        balconySeats: { rows: 2, cols: 10, total: 20 },
        middleSeats: { rows: 3, cols: 10, total: 30 },
        lowerSeats: { rows: 2, cols: 10, total: 20 },
        facilities: ['4DX Motion', 'Dolby Cinema', 'Laser Projection', 'Food Court'],
        createdAt: new Date(),
      },
    ];

    // Helper to generate tier tickets map
    const buildTickets = (bPrice, mPrice, lPrice) => {
      const tickets = {};
      // Balcony (Rows A, B - 10 cols)
      ['A', 'B'].forEach((row) => {
        for (let c = 1; c <= 10; c++) {
          const seatNum = `${row}${c}`;
          tickets[seatNum] = {
            seatNumber: seatNum,
            tier: 'Balcony',
            price: bPrice,
            status: 'available',
            lockedBy: null,
            lockExpiresAt: null,
          };
        }
      });
      // Middle (Rows C, D, E - 10 cols)
      ['C', 'D', 'E'].forEach((row) => {
        for (let c = 1; c <= 10; c++) {
          const seatNum = `${row}${c}`;
          tickets[seatNum] = {
            seatNumber: seatNum,
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
          const seatNum = `${row}${c}`;
          tickets[seatNum] = {
            seatNumber: seatNum,
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

    // Seed Shows across multiple dates
    const showTimes = ['10:30 AM', '02:00 PM', '05:30 PM', '08:45 PM', '11:15 PM'];
    const today = new Date();
    const dates = [0, 1, 2, 3, 4].map((offset) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offset);
      return d;
    });

    let sIdCounter = 101;
    this.movies.filter(m => m.status === 'now_showing').forEach((movie) => {
      this.theatres.forEach((theatre) => {
        dates.slice(0, 3).forEach((dateObj, dIdx) => {
          const selectedTimes = [showTimes[(dIdx) % showTimes.length], showTimes[(dIdx + 2) % showTimes.length]];
          selectedTimes.forEach((time) => {
            const tickets = buildTickets(theatre.balconySeatPrice, theatre.middleSeatPrice, theatre.lowerSeatPrice);
            // Pre-book a couple seats for realism
            if (tickets['C4']) tickets['C4'].status = 'booked';
            if (tickets['C5']) tickets['C5'].status = 'booked';
            if (tickets['A5']) tickets['A5'].status = 'booked';

            this.shows.push({
              _id: `show_${sIdCounter}`,
              showId: `SHW-${sIdCounter}`,
              adminEmail: 'admin@imovies.com',
              movieId: movie._id,
              movieName: movie.movieName,
              theatreName: theatre.theatreName,
              theatreId: theatre._id,
              showDate: dateObj,
              showTime: time,
              tierPricing: {
                balcony: theatre.balconySeatPrice,
                middle: theatre.middleSeatPrice,
                lower: theatre.lowerSeatPrice,
              },
              tickets,
              isActive: true,
              createdAt: new Date(),
            });
            sIdCounter++;
          });
        });
      });
    });

    // Seed Sample Booking
    this.bookings.push({
      _id: 'bkg_1',
      bookingId: 'IMV-PRIME-98214',
      userEmail: 'user@imovies.com',
      showId: 'SHW-101',
      movieName: 'Dune: Part Two',
      theatreName: 'PVR Prime IMAX: Downtown Hub',
      showDate: dates[0].toISOString().split('T')[0],
      showTime: '10:30 AM',
      selectedSeats: ['C4', 'C5'],
      seatDetails: [
        { seatNumber: 'C4', tier: 'Middle', price: 240 },
        { seatNumber: 'C5', tier: 'Middle', price: 240 },
      ],
      subtotal: 480,
      convenienceFee: 56,
      totalAmount: 536,
      paymentStatus: 'Completed',
      paymentMethod: 'Prime Pay / UPI',
      paymentId: 'PAY-PRIME-SIM-8742',
      createdAt: new Date(Date.now() - 3600000),
    });

    // Seed Sample Watchlist
    this.favorites.push(
      {
        _id: 'fav_1',
        userEmail: 'user@imovies.com',
        movieId: 'mov_1',
        movieName: 'Dune: Part Two',
        posterUrl: this.movies[0].posterUrl,
        createdAt: new Date(),
      },
      {
        _id: 'fav_2',
        userEmail: 'user@imovies.com',
        movieId: 'mov_3',
        movieName: 'Interstellar',
        posterUrl: this.movies[2].posterUrl,
        createdAt: new Date(),
      }
    );

    // Seed Sample Reviews
    this.reviews.push(
      {
        _id: 'rev_1',
        userEmail: 'user@imovies.com',
        movieId: 'mov_1',
        username: 'Prime Cinephile',
        rating: 10,
        reviewText: 'An absolute masterpiece in world-building, sound design, and cinematography. Hans Zimmer and Denis Villeneuve delivered one of the greatest sci-fi spectacles ever made!',
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        _id: 'rev_2',
        userEmail: 'rahul@gmail.com',
        movieId: 'mov_1',
        username: 'Rahul S.',
        rating: 9,
        reviewText: 'Incredible experience in IMAX 70mm. The sound shook the entire cinema hall. Highly recommended for cinema lovers.',
        createdAt: new Date(Date.now() - 43200000),
      },
      {
        _id: 'rev_3',
        userEmail: 'priya@gmail.com',
        movieId: 'mov_2',
        username: 'Priya K.',
        rating: 10,
        reviewText: 'Cillian Murphy gives the performance of a lifetime. The Trinity test sequence was nerve-wracking silence and sheer power.',
        createdAt: new Date(Date.now() - 120000000),
      }
    );

    this.isInitialized = true;
    console.log(`[iMovies Engine] In-memory store initialized: ${this.movies.length} movies, ${this.theatres.length} theatres, ${this.shows.length} shows.`);
  }

  // Automatic Lock TTL cleaner
  cleanExpiredLocks() {
    const now = Date.now();
    let cleaned = 0;
    this.shows.forEach((show) => {
      if (show.tickets) {
        Object.values(show.tickets).forEach((seat) => {
          if (seat.status === 'locked' && seat.lockExpiresAt) {
            const exp = new Date(seat.lockExpiresAt).getTime();
            if (now > exp) {
              seat.status = 'available';
              seat.lockedBy = null;
              seat.lockExpiresAt = null;
              cleaned++;
            }
          }
        });
      }
    });
    return cleaned;
  }
}

const store = new DataStore();
module.exports = store;
