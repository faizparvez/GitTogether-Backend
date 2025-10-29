const { default: mongoose } = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 20,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 20,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate(val) {
        if (!validator.isEmail(val)) {
          throw new Error("Invalid Email: " + val);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(val) {
        if (!validator.isStrongPassword(val)) {
          throw new Error("Create a stronger password");
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate(val) {
        if (!["Male", "Female", "Other"].includes(val)) {
          throw new Error("Invalid Gender");
        }
      },
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    membershipType: {
      type: String,
    },
    photoURL: {
      type: String,
      default:
        "https://imgs.search.brave.com/A2GFpXOxr1UxULY05bBKWwACH-PeWkdpYNBUB9IIUik/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/dmVjdG9yc3RvY2su/Y29tL2kvNTAwcC8w/Ni8zMi9zb2NpYWwt/bmV0d29yay1kZWZh/dWx0LXByb2ZpbGUt/cGljdHVyZS1hdmF0/YXItaWNvbi12ZWN0/b3ItNTcxMjA2MzIu/anBn",
      validate(val) {
        if (!validator.isURL(val)) {
          throw new Error("Invalid URL");
        }
      },
    },
    about: {
      type: String,
      default: "Let's get together with GitTogether!",
      maxLength: 500,
    },
    skills: {
      type: [String],
      validate: {
        validator: function (arr) {
          return arr.length <= 20;
        },
        message: "You can add up to 20 skills only",
      },
    },
    // New fields for AI Compatibility Feature
    interests: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 10;
        },
        message: "You can add up to 10 interests only",
      },
    },
    lookingFor: {
      type: [String],
      default: [],
      enum: {
        values: [
          "Project Partner",
          "Co-founder",
          "Mentor",
          "Mentee",
          "Friend",
          "Networking",
          "Open Source Contributor",
          "Freelance Collaboration",
        ],
        message: "Invalid option for lookingFor field",
      },
    },
    location: {
      type: String,
      trim: true,
      maxLength: 100,
    },
    experienceLevel: {
      type: String,
      enum: {
        values: ["Beginner", "Intermediate", "Advanced", "Expert"],
        message: "Invalid experience level",
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = { User };
