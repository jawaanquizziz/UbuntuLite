import mongoose from "mongoose";

const VisitSchema = new mongoose.Schema({
  totalVisits: {
    type: Number,
    default: 0,
  },
});

export default mongoose.models.Visit || mongoose.model("Visit", VisitSchema);
