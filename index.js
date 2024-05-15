const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const port = process.env.PORT || 4000;
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());
require("dotenv").config();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://organic-foods-59169.web.app",
      "https://organic-foods-59169.firebaseapp.com",
    ],
    credentials: true,
  })
);

const logger = async (req, res, next) => {
  console.log("logger is running");
  next();
};

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.SECURE_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rgxjhma.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const LuxuryCollection = client.db("Luxury_HotelDB").collection("Luxury_Hotel");
const MyBookingCollection = client
  .db("Booking_RoomDB")
  .collection("Booking_Room");
const LuxuryRoomsCollection = client
  .db("Luxury_RoomsDB")
  .collection("Luxury_Rooms");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    app.get("/feature_room", async (req, res) => {
      const result = await LuxuryCollection.find().toArray();
      res.send(result);
    });
    app.get("/rooms", async (req, res) => {
      const result = await LuxuryRoomsCollection.find().toArray();
      res.send(result);
    });

    app.post("/myBooking", async (req, res) => {
      const booking = req.body;
      const result = await MyBookingCollection.insertOne(booking);
      res.send(result);
    });
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.SECURE_TOKEN, {
        expiresIn: "365d",
      });
      res.cookie("token", token, cookieOptions).send({ success: true });
    });

    app.post("/logout", async (req, res) => {
      const user = req.body;
      res
        .clearCookie("token", { ...cookieOptions, maxAge: 0 })
        .send({ success: true });
    });

    app.get("/myBookingRoom/:email", logger, verifyToken, async (req, res) => {
      if (req.params.email !== req.user.logged) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const email = req.params.email;
      const query = { email: email };
      const result = await MyBookingCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/roomDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await LuxuryRoomsCollection.findOne(query);
      res.send(result);
    });

    app.patch("/availableRooms/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateRoom = req.body;
      const rooms = {
        $set: {
          availability: updateRoom.availability,
        },
      };
      const result = await LuxuryRoomsCollection.updateOne(
        query,
        rooms,
        options
      );
      res.send(result);
    });

    app.patch("/deletedAvailability/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateRoom = req.body;
      const rooms = {
        $set: {
          availability: updateRoom.availability,
        },
      };
      const result = await LuxuryRoomsCollection.updateOne(
        query,
        rooms,
        options
      );
      res.send(result);
    });

    app.patch("/updateDate/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateRoom = req.body;
      const rooms = {
        $set: {
          newDates: updateRoom.newDates,
        },
      };
      const result = await MyBookingCollection.updateOne(query, rooms, options);
      res.send(result);
    });

    app.delete("/deleteBook/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await MyBookingCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/reviewUpdate/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const update = req.body;
      const updateReview = {
        $set: {
          reviews: update.reviews,
        },
      };
      const result = await LuxuryRoomsCollection.updateOne(
        query,
        updateReview,
        options
      );
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Luxury Hotel Is Running");
});

app.listen(port, () => {
  console.log(`Luxury Hotel app listening on port ${port}`);
});
