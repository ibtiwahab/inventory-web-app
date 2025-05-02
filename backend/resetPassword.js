const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

mongoose.connect("mongodb://localhost:27017/inventorydb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
});

const User = mongoose.model("User", userSchema);

async function updatePassword() {
  const hashedPassword = await bcrypt.hash("superadmin123", 10);
  await User.updateOne(
    { username: "superadmin" },
    { $set: { password: hashedPassword } }
  );
  console.log("✅ Password updated to: superadmin123");
  mongoose.disconnect();
}

updatePassword();
