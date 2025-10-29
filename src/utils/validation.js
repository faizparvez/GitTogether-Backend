const validator = require("validator");

const validateSignupData = (req) => {
  const { firstName, lastName, email, password } = req.body;

  // Required fields validation
  if (!firstName || firstName.trim().length === 0) {
    throw new Error("First name is required");
  }
  if (firstName.length > 20) {
    throw new Error("First name must be less than 20 characters");
  }

  if (!lastName || lastName.trim().length === 0) {
    throw new Error("Last name is required");
  }
  if (lastName.length > 20) {
    throw new Error("Last name must be less than 20 characters");
  }

  if (!validator.isEmail(email)) {
    throw new Error("Invalid email address");
  }

  if (!validator.isStrongPassword(password)) {
    throw new Error(
      "Password must be stronger. Include uppercase, lowercase, numbers and special characters"
    );
  }
};

const validateEditprofileData = (req) => {
  // Define fields that CAN be edited
  const allowedEditFields = [
    "firstName",
    "lastName",
    "photoURL", // Fixed: was "photoUrl", schema uses "photoURL"
    "gender",
    "age",
    "about",
    "skills",
    // New AI Compatibility fields
    "interests",
    "lookingFor",
    "location",
    "experienceLevel",
  ];

  // Fields that CANNOT be edited
  const restrictedFields = ["email", "password", "isPremium", "membershipType"];

  const requestFields = Object.keys(req.body);

  // Check if any restricted field is being edited
  const hasRestrictedFields = requestFields.some((field) =>
    restrictedFields.includes(field)
  );

  if (hasRestrictedFields) {
    throw new Error("Cannot edit email, password, or membership fields");
  }

  // Check if all fields in request are allowed
  const invalidFields = requestFields.filter(
    (field) => !allowedEditFields.includes(field)
  );

  if (invalidFields.length > 0) {
    throw new Error(`Invalid fields: ${invalidFields.join(", ")}`);
  }

  // Validate specific field constraints
  const {
    firstName,
    lastName,
    age,
    gender,
    about,
    skills,
    interests,
    lookingFor,
    location,
    experienceLevel,
  } = req.body;

  // Validate firstName
  if (firstName !== undefined) {
    if (!firstName || firstName.trim().length === 0) {
      throw new Error("First name cannot be empty");
    }
    if (firstName.length > 20) {
      throw new Error("First name must be less than 20 characters");
    }
  }

  // Validate lastName
  if (lastName !== undefined) {
    if (!lastName || lastName.trim().length === 0) {
      throw new Error("Last name cannot be empty");
    }
    if (lastName.length > 20) {
      throw new Error("Last name must be less than 20 characters");
    }
  }

  // Validate age
  if (age !== undefined && age < 18) {
    throw new Error("Age must be at least 18");
  }

  // Validate gender
  if (gender && !["Male", "Female", "Other"].includes(gender)) {
    throw new Error("Gender must be Male, Female, or Other");
  }

  // Validate about
  if (about !== undefined && about.length > 500) {
    throw new Error("About section must be less than 500 characters");
  }

  // Validate skills
  if (skills !== undefined) {
    if (!Array.isArray(skills)) {
      throw new Error("Skills must be an array");
    }
    if (skills.length > 20) {
      throw new Error("Maximum 20 skills allowed");
    }
  }

  // Validate interests
  if (interests !== undefined) {
    if (!Array.isArray(interests)) {
      throw new Error("Interests must be an array");
    }
    if (interests.length > 10) {
      throw new Error("Maximum 10 interests allowed");
    }
  }

  // Validate lookingFor
  const validLookingForOptions = [
    "Project Partner",
    "Co-founder",
    "Mentor",
    "Mentee",
    "Friend",
    "Networking",
    "Open Source Contributor",
    "Freelance Collaboration",
  ];

  if (lookingFor !== undefined) {
    if (!Array.isArray(lookingFor)) {
      throw new Error("LookingFor must be an array");
    }
    const invalidOptions = lookingFor.filter(
      (option) => !validLookingForOptions.includes(option)
    );
    if (invalidOptions.length > 0) {
      throw new Error(
        `Invalid lookingFor options: ${invalidOptions.join(", ")}`
      );
    }
  }

  // Validate location
  if (location !== undefined && location.length > 100) {
    throw new Error("Location must be less than 100 characters");
  }

  // Validate experienceLevel
  const validExperienceLevels = [
    "Beginner",
    "Intermediate",
    "Advanced",
    "Expert",
  ];
  if (experienceLevel && !validExperienceLevels.includes(experienceLevel)) {
    throw new Error(
      "Experience level must be Beginner, Intermediate, Advanced, or Expert"
    );
  }

  return true;
};

module.exports = { validateSignupData, validateEditprofileData };
