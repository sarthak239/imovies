const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Models
const User = require('../models/User');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const { generateSeats } = require('../controllers/showController');

dotenv.config({ path: __dirname + '/../.env' });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies_db';
    console.log(`[iMovies Seeder] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[iMovies Seeder] Dropping old database collections to ensure clean indexes...');
    await mongoose.connection.dropDatabase();

    console.log('[iMovies Seeder] Creating Users...');
    // Create Admin User
    const adminUser = await User.create({
      name: 'iMovies Admin Console',
      email: 'admin@imovies.com',
      password: 'Admin@123456',
      phone: '+91 9900011223',
      role: 'admin',
    });

    // Create Sample Customer User
    const customerUser = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@gmail.com',
      password: 'User@123456',
      phone: '+91 9876543210',
      role: 'user',
    });

    console.log(`[iMovies Seeder] Admin user created: admin@imovies.com / Admin@123456`);
    console.log(`[iMovies Seeder] Customer user created: rahul@gmail.com / User@123456`);

    console.log('[iMovies Seeder] Inserting Theaters...');
    const theaters = await Theater.insertMany([
      {
        name: 'PVR INOX: Orion Mall',
        location: 'Brigade Gateway, Malleshwaram',
        city: 'Bengaluru',
        address: 'Dr. Rajkumar Road, Rajajinagar, Bengaluru, Karnataka 560055',
        facilities: ['Dolby Atmos', '4K Laser Projection', 'PVR LUXE', 'Gourmet Dine-In', 'Valet Parking'],
        screens: [
          { name: 'Audi 1 (IMAX)', screenType: 'IMAX 3D', totalSeats: 72 },
          { name: 'Audi 2 (Dolby Atmos)', screenType: 'Dolby Cinema', totalSeats: 72 },
        ],
      },
      {
        name: 'Cinepolis: Nexus Forum Mall',
        location: 'Hosur Road, Koramangala',
        city: 'Bengaluru',
        address: '21, Hosur Rd, Chikku Lakshmaiah Layout, Koramangala, Bengaluru, Karnataka 560095',
        facilities: ['Dolby 7.1', 'VIP Recliners', 'Coffee Lounge', 'Wheelchair Accessible'],
        screens: [
          { name: 'Screen 1', screenType: 'Standard 2D', totalSeats: 72 },
          { name: 'Screen 2 (Macro XE)', screenType: 'Dolby Cinema', totalSeats: 72 },
        ],
      },
      {
        name: 'PVR: Phoenix Marketcity',
        location: 'LBS Marg, Kurla West',
        city: 'Mumbai',
        address: 'Phoenix Marketcity Mall, Kurla West, Mumbai, Maharashtra 400070',
        facilities: ['IMAX 3D', 'Dolby Atmos', '4DX Motion Seats', 'Luxury Recliner Seats'],
        screens: [
          { name: 'IMAX Laser Audi', screenType: 'IMAX 3D', totalSeats: 72 },
          { name: 'Audi 4 (4DX)', screenType: '4DX', totalSeats: 72 },
        ],
      },
      {
        name: 'INOX: Insignia Nariman Point',
        location: 'CR2 Mall, Nariman Point',
        city: 'Mumbai',
        address: 'Barrister Rajni Patel Marg, Nariman Point, Mumbai, Maharashtra 400021',
        facilities: ['Insignia Luxury', 'Gourmet Chef Menu', 'Dolby Atmos', 'Butler on Call'],
        screens: [{ name: 'Insignia 1', screenType: 'Dolby Cinema', totalSeats: 72 }],
      },
      {
        name: 'PVR Directors Cut: Ambience Mall',
        location: 'Nelson Mandela Marg, Vasant Kunj',
        city: 'Delhi NCR',
        address: 'Ambience Mall, Vasant Kunj II, New Delhi, Delhi 110070',
        facilities: ['Ultra Luxury Lounger', 'Fine Dine Menu', 'Dolby Atmos Sound', 'Personal Concierge'],
        screens: [{ name: 'Screen DC-1', screenType: 'Dolby Cinema', totalSeats: 72 }],
      },
      {
        name: 'Prasads Multiplex: Large Screen',
        location: 'NTR Gardens, Necklace Road',
        city: 'Hyderabad',
        address: 'Prasads IMAX, NTR Gardens, Necklace Road, Hyderabad, Telangana 500063',
        facilities: ['Giant Screen', 'Dolby Atmos', 'Game Zone', 'Extensive Food Court'],
        screens: [{ name: 'Giant Screen Audi', screenType: 'IMAX 3D', totalSeats: 72 }],
      },
    ]);

    console.log('[iMovies Seeder] Inserting Movies...');
    const movies = await Movie.insertMany([
      {
        title: 'Dune: Part Two',
        description:
          'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
        genre: ['Sci-Fi', 'Adventure', 'Action', 'Drama'],
        duration: 166,
        language: ['English', 'Hindi'],
        rating: 8.6,
        releaseDate: new Date('2024-03-01'),
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        status: 'now_showing',
        cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem', 'Josh Brolin'],
        director: 'Denis Villeneuve',
        censorRating: 'UA',
        featured: true,
      },
      {
        title: 'Oppenheimer',
        description:
          'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the moral and scientific dilemmas of modern warfare.',
        genre: ['Biography', 'Drama', 'History'],
        duration: 180,
        language: ['English', 'Hindi'],
        rating: 8.9,
        releaseDate: new Date('2023-07-21'),
        posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=800&auto=format&fit=crop',
        backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1600&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        status: 'now_showing',
        cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh'],
        director: 'Christopher Nolan',
        censorRating: 'UA',
        featured: true,
      },
      {
        title: 'Interstellar',
        description:
          'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
        genre: ['Sci-Fi', 'Adventure', 'Drama'],
        duration: 169,
        language: ['English'],
        rating: 8.7,
        releaseDate: new Date('2014-11-07'),
        posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
        backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1600&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        status: 'now_showing',
        cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
        director: 'Christopher Nolan',
        censorRating: 'UA',
        featured: true,
      },
      {
        title: 'The Dark Knight',
        description:
          'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        genre: ['Action', 'Crime', 'Drama'],
        duration: 152,
        language: ['English', 'Hindi'],
        rating: 9.0,
        releaseDate: new Date('2008-07-18'),
        posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
        backdropUrl: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?q=80&w=1600&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
        status: 'now_showing',
        cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine', 'Gary Oldman'],
        director: 'Christopher Nolan',
        censorRating: 'UA',
        featured: false,
      },
      {
        title: 'Gladiator II',
        description:
          'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.',
        genre: ['Action', 'Drama', 'Adventure'],
        duration: 148,
        language: ['English', 'Hindi'],
        rating: 8.2,
        releaseDate: new Date('2024-11-15'),
        posterUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
        status: 'now_showing',
        cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
        director: 'Ridley Scott',
        censorRating: 'A',
        featured: false,
      },
      {
        title: 'Spider-Man: Across the Spider-Verse',
        description:
          'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
        genre: ['Animation', 'Action', 'Adventure', 'Sci-Fi'],
        duration: 140,
        language: ['English', 'Hindi', 'Tamil'],
        rating: 8.7,
        releaseDate: new Date('2023-06-02'),
        posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=800&auto=format&fit=crop',
        backdropUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1600&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
        status: 'now_showing',
        cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Daniel Kaluuya'],
        director: 'Joaquim Dos Santos, Kemp Powers',
        censorRating: 'U',
        featured: false,
      },
      // Upcoming Movies
      {
        title: 'Avatar: Fire and Ash',
        description:
          'Jake Sully and Neytiri return to explore uncharted regions of Pandora, discovering volcanic landscapes and encountering hostile Na\'vi clans known as the Ash People in James Cameron\'s cinematic epic.',
        genre: ['Sci-Fi', 'Adventure', 'Action'],
        duration: 190,
        language: ['English', 'Hindi', 'Tamil', 'Telugu'],
        rating: 9.1,
        releaseDate: new Date('2025-12-19'),
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
        backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
        status: 'upcoming',
        cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Stephen Lang'],
        director: 'James Cameron',
        censorRating: 'UA',
        featured: true,
      },
      {
        title: 'Mission: Impossible - The Final Reckoning',
        description:
          'Our lives are the sum of our choices. Ethan Hunt and the IMF team embark on their final and most dangerous mission yet to track down a terrifying AI weapon before it falls into the wrong hands.',
        genre: ['Action', 'Thriller', 'Adventure'],
        duration: 165,
        language: ['English', 'Hindi'],
        rating: 8.8,
        releaseDate: new Date('2025-05-23'),
        posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop',
        backdropUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=1600&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/watch?v=NOhDyHN4jhs',
        status: 'upcoming',
        cast: ['Tom Cruise', 'Hayley Atwell', 'Ving Rhames', 'Simon Pegg', 'Vanessa Kirby'],
        director: 'Christopher McQuarrie',
        censorRating: 'UA',
        featured: false,
      },
    ]);

    console.log('[iMovies Seeder] Generating Shows...');
    // Generate dates: today, tomorrow, day+2, day+3
    const formatYMD = (date) => date.toISOString().split('T')[0];
    const today = new Date();
    const dates = [0, 1, 2, 3].map((offset) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offset);
      return formatYMD(d);
    });

    const nowShowingMovies = movies.filter((m) => m.status === 'now_showing');
    const showTimes = ['10:30 AM', '01:45 PM', '05:15 PM', '08:30 PM', '11:00 PM'];

    const showsToInsert = [];

    theaters.forEach((theater, tIdx) => {
      nowShowingMovies.forEach((movie, mIdx) => {
        dates.forEach((dateStr) => {
          // Stagger showtimes across theaters and movies
          const selectedTimes = [
            showTimes[(tIdx + mIdx) % showTimes.length],
            showTimes[(tIdx + mIdx + 2) % showTimes.length],
          ];

          selectedTimes.forEach((time) => {
            const pricing = {
              silver: 180 + (tIdx % 2) * 20,
              gold: 260 + (tIdx % 2) * 30,
              vip: 420 + (tIdx % 2) * 50,
            };

            const seatMatrix = generateSeats(pricing);

            showsToInsert.push({
              movie: movie._id,
              theater: theater._id,
              screenName: theater.screens[0]?.name || 'Screen 1',
              showDate: dateStr,
              showTime: time,
              tierPricing: pricing,
              seatMatrix,
              totalSeats: seatMatrix.length,
              availableSeats: seatMatrix.length,
              isActive: true,
            });
          });
        });
      });
    });

    console.log(`[iMovies Seeder] Inserting ${showsToInsert.length} shows...`);
    const insertedShows = await Show.insertMany(showsToInsert);

    // Let's create an initial realistic booking for Rahul Sharma to showcase the feature
    console.log('[iMovies Seeder] Creating sample confirmed booking for demo...');
    const demoShow = insertedShows[0];
    const demoMovie = movies.find((m) => m._id.toString() === demoShow.movie.toString());
    const demoTheater = theaters.find((t) => t._id.toString() === demoShow.theater.toString());

    // Book seats C4, C5 in demoShow
    const bookedSeats = ['C4', 'C5'];
    bookedSeats.forEach((sNum) => {
      const seat = demoShow.seatMatrix.find((s) => s.seatNumber === sNum);
      if (seat) {
        seat.isBooked = true;
        seat.bookedBy = customerUser._id;
        seat.bookingReference = 'IMV-SAMPLE-DEMO1';
      }
    });
    demoShow.availableSeats -= bookedSeats.length;
    await demoShow.save();

    const sampleBooking = await Booking.create({
      bookingReference: 'IMV-SAMPLE-DEMO1',
      user: customerUser._id,
      movie: demoMovie._id,
      theater: demoTheater._id,
      show: demoShow._id,
      movieTitle: demoMovie.title,
      theaterName: demoTheater.name,
      theaterCity: demoTheater.city,
      screenName: demoShow.screenName,
      showDate: demoShow.showDate,
      showTime: demoShow.showTime,
      seats: bookedSeats,
      seatDetails: [
        { seatNumber: 'C4', tier: 'Gold', price: demoShow.tierPricing.gold },
        { seatNumber: 'C5', tier: 'Gold', price: demoShow.tierPricing.gold },
      ],
      ticketCount: 2,
      subtotal: demoShow.tierPricing.gold * 2,
      convenienceFee: 56,
      totalAmount: demoShow.tierPricing.gold * 2 + 56,
      paymentStatus: 'completed',
      paymentMethod: 'UPI',
      paymentId: 'PAY-SIM-DEMO-99881',
      bookingStatus: 'confirmed',
    });

    console.log(`[iMovies Seeder] Sample booking created: ${sampleBooking.bookingReference}`);
    console.log('[iMovies Seeder] SUCCESS! Database seeded with rich movies, theaters, shows, and users.');
    process.exit(0);
  } catch (error) {
    console.error('[iMovies Seeder] ERROR seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
