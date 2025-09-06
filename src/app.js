const express = require("express");
const { connectDB } = require("./config/database");
const app = express();
const cors = require("cors");

const cookieParser = require("cookie-parser");

const { authRouter } = require("./routes/auth");
const { profileRouter } = require("./routes/profile");
const { requestRouter } = require("./routes/request");
const { userRouter } = require("./routes/user");

app.use(
  cors({
    origin: "http://localhost:5173", // your frontend origin (we are whitelisting our frontend domain name)
    credentials: true, // we can send cookies even if we are not making https request
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(3000, () => {
      console.log("Server is listening on port 3000...");
    });
  })
  .catch((err) => {
    console.error("Database connection can't be established");
  });
