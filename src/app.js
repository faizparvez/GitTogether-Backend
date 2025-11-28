const express = require("express");
const { connectDB } = require("./config/database");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const http = require("http");

// for .env file to work
require("dotenv").config();
// require("./utils/cronjob");

app.use(
  cors({
    origin: ["https://gitt-together.vercel.app", "http://localhost:5173"], // your frontend origin (we are whitelisting our frontend domain name)
    credentials: true, // we can send cookies even if we are not making https request
  })
);
app.use(express.json());
app.use(cookieParser());

const { authRouter } = require("./routes/auth");
const { profileRouter } = require("./routes/profile");
const { requestRouter } = require("./routes/request");
const { userRouter } = require("./routes/user");
const { paymentRouter } = require("./routes/payment");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);

const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    server.listen(process.env.PORT, () => {
      console.log("Server is listening on port 3000...");
    });
  })
  .catch((err) => {
    console.error("Database connection can't be established");
  });
