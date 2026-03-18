import mongoose from "mongoose";

const TerminalUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.TerminalUser || mongoose.model("TerminalUser", TerminalUserSchema);
