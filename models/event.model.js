import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    sport: { type: String, required: true, index: true },
    pin: { type: String, required: true, index: true },
    location: { type: String, required: true },
    detailedLocation: { type: String, required: false },
    price: { type: Number, required: false },
    image_urls: { type: Array, required: false },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    players: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', required: false, default: [] },
    NoOfSeats: { type: Number, required: true },
    isActive: { type: Boolean, required: true, default: true, index: true },
    lat: { type: Number, required: false },
    lng: { type: Number, required: false },
    time: { type: String, required: false },
      expireAt: {
        type: Date,
        default: function () {
            // expire 24h after the event date
            return new Date(this.date.getTime() + 24 * 60 * 60 * 1000);
        },
        index: { expires: 0 } // TTL index (expireAt itself decides when)
    } 
});

// Add compound indexes for common queries
eventSchema.index({ sport: 1, date: 1 });
eventSchema.index({ isActive: 1, date: 1 });
eventSchema.index({ pin: 1, isActive: 1 });
eventSchema.index({ host: 1 });

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);

export default Event;