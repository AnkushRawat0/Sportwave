import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Import models
const userSchema = new mongoose.Schema({
    google_id: { type: String, required: false, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: function () { return !this.google_id; } },
    name: { type: String, required: true },
    phone: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    zip: { type: String, required: false },
    country: { type: String, required: false },
    photo_url: { type: String, required: false },
    rating: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating', required: false },
    events_booked: { type: [mongoose.Schema.Types.ObjectId], ref: 'Event', required: false, default: [] },
    events_hosted: { type: [mongoose.Schema.Types.ObjectId], ref: 'Event', required: false },
    total_events_hosted: { type: Number, required: false },
    total_rating: { type: Number, required: false },
    avg_rating: { type: Number, required: false },
    sports: { type: [String], required: false },
    age: { type: Number, required: false },
    gender: { type: String, required: false },
    height: { type: Number, required: false },
    weight: { type: Number, required: false },
    bio: { type: String, required: false },
}, { timestamps: true });

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    sport: { type: String, required: true },
    pin: { type: String, required: true },
    location: { type: String, required: true },
    detailedLocation: { type: String, required: false },
    price: { type: Number, required: false },
    image_urls: { type: Array, required: false },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    players: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', required: false, default: [] },
    NoOfSeats: { type: Number, required: true },
    isActive: { type: Boolean, required: true, default: true },
    lat: { type: Number, required: false },
    lng: { type: Number, required: false },
    time: { type: String, required: false },
    expireAt: {
        type: Date,
        default: function () {
            return new Date(this.date.getTime() + 24 * 60 * 60 * 1000);
        },
        index: { expires: 0 }
    }
});

const User = mongoose.model('User', userSchema);
const Event = mongoose.model('Event', eventSchema);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...\n');

        // Clear existing data
        await User.deleteMany({});
        await Event.deleteMany({});
        console.log('🗑️  Cleared existing data\n');

        // Hash password for sample users
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Create sample users
        const users = await User.insertMany([
            {
                email: 'john.doe@example.com',
                password: hashedPassword,
                name: 'John Doe',
                phone: '+1234567890',
                city: 'New York',
                state: 'NY',
                zip: '10001',
                country: 'USA',
                sports: ['Football', 'Basketball'],
                age: 28,
                gender: 'Male',
                height: 180,
                weight: 75,
                bio: 'Passionate football player, love playing competitive games!',
                avg_rating: 4.5,
                total_events_hosted: 5
            },
            {
                email: 'jane.smith@example.com',
                password: hashedPassword,
                name: 'Jane Smith',
                phone: '+1234567891',
                city: 'Los Angeles',
                state: 'CA',
                zip: '90001',
                country: 'USA',
                sports: ['Tennis', 'Volleyball'],
                age: 25,
                gender: 'Female',
                height: 165,
                weight: 60,
                bio: 'Tennis enthusiast, looking for regular matches.',
                avg_rating: 4.8,
                total_events_hosted: 3
            },
            {
                email: 'mike.wilson@example.com',
                password: hashedPassword,
                name: 'Mike Wilson',
                phone: '+1234567892',
                city: 'Chicago',
                state: 'IL',
                zip: '60601',
                country: 'USA',
                sports: ['Basketball', 'Cricket'],
                age: 30,
                gender: 'Male',
                height: 188,
                weight: 85,
                bio: 'Basketball coach, always up for a game!',
                avg_rating: 4.3,
                total_events_hosted: 8
            },
            {
                email: 'sarah.jones@example.com',
                password: hashedPassword,
                name: 'Sarah Jones',
                phone: '+1234567893',
                city: 'Miami',
                state: 'FL',
                zip: '33101',
                country: 'USA',
                sports: ['Football', 'Volleyball'],
                age: 26,
                gender: 'Female',
                height: 170,
                weight: 62,
                bio: 'Love playing beach volleyball and soccer!',
                avg_rating: 4.6,
                total_events_hosted: 2
            }
        ]);

        console.log(`✅ Created ${users.length} sample users`);

        // Create sample events (mix of past and future dates)
        const now = new Date();
        const events = await Event.insertMany([
            {
                name: 'Weekend Football Match',
                description: 'Casual 5v5 football match at Central Park. All skill levels welcome!',
                date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
                time: '10:00 AM',
                sport: 'Football',
                pin: '10001',
                location: 'Central Park, New York, NY',
                detailedLocation: 'Great Lawn, Central Park',
                price: 0,
                host: users[0]._id,
                players: [users[1]._id, users[3]._id],
                NoOfSeats: 10,
                isActive: true,
                lat: 40.7829,
                lng: -73.9654
            },
            {
                name: 'Basketball Tournament',
                description: '3v3 basketball tournament with prizes! Competitive level players preferred.',
                date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
                time: '2:00 PM',
                sport: 'Basketball',
                pin: '90001',
                location: 'Venice Beach Courts, Los Angeles, CA',
                detailedLocation: 'Venice Beach Basketball Courts',
                price: 20,
                host: users[2]._id,
                players: [users[0]._id],
                NoOfSeats: 6,
                isActive: true,
                lat: 33.9850,
                lng: -118.4695
            },
            {
                name: 'Tennis Doubles Match',
                description: 'Looking for players for doubles tennis. Intermediate level.',
                date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
                time: '6:00 PM',
                sport: 'Tennis',
                pin: '90001',
                location: 'Santa Monica Tennis Club, Los Angeles, CA',
                detailedLocation: 'Court 3, Santa Monica Tennis Club',
                price: 15,
                host: users[1]._id,
                players: [users[3]._id],
                NoOfSeats: 4,
                isActive: true,
                lat: 34.0195,
                lng: -118.4912
            },
            {
                name: 'Volleyball Beach Game',
                description: 'Beach volleyball game at sunset. Fun and casual!',
                date: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
                time: '5:30 PM',
                sport: 'Volleyball',
                pin: '33101',
                location: 'South Beach, Miami, FL',
                detailedLocation: '10th Street Beach Courts',
                price: 0,
                host: users[3]._id,
                players: [users[1]._id, users[2]._id],
                NoOfSeats: 8,
                isActive: true,
                lat: 25.7907,
                lng: -80.1300
            },
            {
                name: 'Cricket Practice Session',
                description: 'Weekly cricket practice. Bring your own equipment!',
                date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
                time: '9:00 AM',
                sport: 'Cricket',
                pin: '60601',
                location: 'Lincoln Park, Chicago, IL',
                detailedLocation: 'North Athletic Field',
                price: 0,
                host: users[2]._id,
                players: [users[0]._id, users[1]._id],
                NoOfSeats: 12,
                isActive: true,
                lat: 41.9214,
                lng: -87.6387
            },
            {
                name: 'Sunday Morning Football',
                description: 'Regular Sunday football game. Open to all ages!',
                date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
                time: '8:00 AM',
                sport: 'Football',
                pin: '60601',
                location: 'Grant Park, Chicago, IL',
                detailedLocation: 'South Fields',
                price: 5,
                host: users[0]._id,
                players: [users[2]._id],
                NoOfSeats: 14,
                isActive: true,
                lat: 41.8756,
                lng: -87.6244
            }
        ]);

        console.log(`✅ Created ${events.length} sample events\n`);

        // Update users with their booked/hosted events
        await User.findByIdAndUpdate(users[0]._id, {
            events_hosted: [events[0]._id, events[5]._id],
            events_booked: [events[1]._id, events[4]._id]
        });

        await User.findByIdAndUpdate(users[1]._id, {
            events_hosted: [events[2]._id],
            events_booked: [events[0]._id, events[3]._id, events[4]._id]
        });

        await User.findByIdAndUpdate(users[2]._id, {
            events_hosted: [events[1]._id, events[4]._id],
            events_booked: [events[3]._id, events[5]._id]
        });

        await User.findByIdAndUpdate(users[3]._id, {
            events_hosted: [events[3]._id],
            events_booked: [events[0]._id, events[2]._id]
        });

        console.log('✅ Updated user relationships\n');

        console.log('🎉 Database seeding completed successfully!\n');
        console.log('📋 Sample Users Created:');
        users.forEach(user => {
            console.log(`   - ${user.name} (${user.email}) - Password: password123`);
        });
        
        console.log('\n📅 Sample Events Created:');
        events.forEach(event => {
            console.log(`   - ${event.name} (${event.sport}) - ${event.date.toDateString()}`);
        });

        console.log('\n✨ You can now login with any of the sample users!');
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
};

// Run the seeding
connectDB().then(seedDatabase);
