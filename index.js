const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const port = process.env.PORT || 4000;
const cors = require("cors");

// middle ware
app.use(express.json());
require("dotenv").config();
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

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

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
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

    app.get("/myBookingRoom/:email", async (req, res) => {
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
      const result = await LuxuryRoomsCollection.updateOne(
        query,
        rooms,
        options
      );
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Luxury Hotel Is Running");
});

app.listen(port, () => {
  console.log(`Luxury Hotel app listening on port ${port}`);
});
