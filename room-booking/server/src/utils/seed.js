const mongoose = require('mongoose');
const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Room.deleteMany({});
    await Booking.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create admin user
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'Admin@123',
      role: 'admin'
    });
    console.log(`✅ Admin created: ${admin.email} / Admin@123\n`);

    // Create sample regular users
    console.log('👥 Creating sample users...');
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john@demo.com',
        password: 'User@123',
        role: 'user'
      },
      {
        name: 'Jane Smith',
        email: 'jane@demo.com',
        password: 'User@123',
        role: 'user'
      },
      {
        name: 'Bob Johnson',
        email: 'bob@demo.com',
        password: 'User@123',
        role: 'user'
      }
    ]);
    console.log(`✅ Created ${users.length} sample users\n`);

    // Create sample rooms
    console.log('🏢 Creating sample rooms...');
    const rooms = await Room.create([
      {
        name: 'Conference Room A',
        capacity: 10,
        amenities: ['Projector', 'Whiteboard', 'Video Conference', 'WiFi'],
        location: 'Building 1, Floor 2',
        description: 'Large conference room with modern amenities',
        isActive: true
      },
      {
        name: 'Meeting Room B',
        capacity: 6,
        amenities: ['Whiteboard', 'TV Screen', 'WiFi'],
        location: 'Building 1, Floor 3',
        description: 'Medium-sized meeting room for team discussions',
        isActive: true
      },
      {
        name: 'Executive Suite',
        capacity: 15,
        amenities: ['Projector', 'Whiteboard', 'Video Conference', 'WiFi', 'Catering'],
        location: 'Building 2, Floor 5',
        description: 'Premium room for executive meetings and presentations',
        isActive: true
      },
      {
        name: 'Huddle Room 1',
        capacity: 4,
        amenities: ['TV Screen', 'WiFi'],
        location: 'Building 1, Floor 2',
        description: 'Small room for quick team huddles',
        isActive: true
      },
      {
        name: 'Training Room',
        capacity: 20,
        amenities: ['Projector', 'Whiteboard', 'Video Conference', 'WiFi', 'Sound System'],
        location: 'Building 2, Floor 1',
        description: 'Large training room with theater-style seating',
        isActive: true
      }
    ]);
    console.log(`✅ Created ${rooms.length} sample rooms\n`);

    // Create sample bookings
    console.log('📅 Creating sample bookings...');

    // Booking 1: Tomorrow 9 AM - 11 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const booking1Start = new Date(tomorrow);
    booking1Start.setHours(9, 0, 0, 0);

    const booking1End = new Date(tomorrow);
    booking1End.setHours(11, 0, 0, 0);

    // Booking 2: Tomorrow 2 PM - 4 PM
    const booking2Start = new Date(tomorrow);
    booking2Start.setHours(14, 0, 0, 0);

    const booking2End = new Date(tomorrow);
    booking2End.setHours(16, 0, 0, 0);

    // Booking 3: Day after tomorrow 10 AM - 12 PM
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    dayAfterTomorrow.setHours(0, 0, 0, 0);

    const booking3Start = new Date(dayAfterTomorrow);
    booking3Start.setHours(10, 0, 0, 0);

    const booking3End = new Date(dayAfterTomorrow);
    booking3End.setHours(12, 0, 0, 0);

    const bookings = await Booking.create([
      {
        room: rooms[0]._id, // Conference Room A
        user: users[0]._id, // John
        date: tomorrow,
        startTime: booking1Start,
        endTime: booking1End,
        purpose: 'Sprint Planning Meeting',
        status: 'confirmed'
      },
      {
        room: rooms[1]._id, // Meeting Room B
        user: users[1]._id, // Jane
        date: tomorrow,
        startTime: booking2Start,
        endTime: booking2End,
        purpose: 'Client Presentation',
        status: 'confirmed'
      },
      {
        room: rooms[2]._id, // Executive Suite
        user: admin._id,
        date: dayAfterTomorrow,
        startTime: booking3Start,
        endTime: booking3End,
        purpose: 'Board Meeting',
        status: 'confirmed'
      }
    ]);
    console.log(`✅ Created ${bookings.length} sample bookings\n`);

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📝 Login Credentials:');
    console.log('   Admin: admin@demo.com / Admin@123');
    console.log('   User1: john@demo.com / User@123');
    console.log('   User2: jane@demo.com / User@123');
    console.log('   User3: bob@demo.com / User@123\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

const run = async () => {
  try {
    await connectDB();
    await seedDatabase();
    console.log('👋 Closing database connection...');
    await mongoose.connection.close();
    console.log('✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

run();
