const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "afterSchool";
const IMAGES_DIR = path.join(__dirname, "public", "images");

let db;

app.use(cors());
app.use(express.json());

// Logger middleware: prints every request to the server console (Render logs).
app.use(function logger(req, res, next) {
  const time = new Date().toISOString();
  console.log("[" + time + "] " + req.method + " " + req.originalUrl);
  next();
});

// Static file middleware for lesson images.
// If the file exists it is returned; otherwise the next handler sends an error.
app.use("/images", express.static(IMAGES_DIR));
app.use("/images", function missingImage(req, res) {
  res.status(404).json({
    error: "Image file does not exist",
    path: req.originalUrl
  });
});

function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isValidObjectId(id) {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === String(id);
}

app.get("/", function (req, res) {
  res.json({
    message: "After-school classes API",
    routes: [
      "GET /lessons",
      "GET /lessons?teacherId=",
      "GET /search?q=",
      "POST /orders",
      "PUT /lessons/:id",
      "GET /teachers",
      "GET /enrolment/:lessonid",
      "GET /images/:filename"
    ]
  });
});

app.get("/lessons", async function (req, res) {
  try {
    const filter = {};
    if (req.query.teacherId) {
      if (!isValidObjectId(req.query.teacherId)) {
        return res.status(400).json({ error: "Invalid teacherId" });
      }
      filter.teacherId = new ObjectId(req.query.teacherId);
    }
    const lessons = await db.collection("lessons").find(filter).toArray();
    res.json(lessons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load lessons" });
  }
});

app.get("/search", async function (req, res) {
  try {
    const q = (req.query.q || "").trim();
    if (!q) {
      const lessons = await db.collection("lessons").find({}).toArray();
      return res.json(lessons);
    }

    const regex = new RegExp(escapeRegex(q), "i");
    const lessons = await db.collection("lessons").find({
      $or: [
        { topic: regex },
        { location: regex },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$price" },
              regex: escapeRegex(q),
              options: "i"
            }
          }
        },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$space" },
              regex: escapeRegex(q),
              options: "i"
            }
          }
        }
      ]
    }).toArray();
    res.json(lessons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

app.get("/teachers", async function (req, res) {
  try {
    const teachers = await db.collection("teachers").find({}).toArray();
    res.json(teachers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load teachers" });
  }
});

app.get("/enrolment/:lessonid", async function (req, res) {
  try {
    const lessonId = req.params.lessonid;
    if (!isValidObjectId(lessonId)) {
      return res.status(400).json({ error: "Invalid lesson id" });
    }

    const orders = await db.collection("orders").find({
      $or: [
        { "lessons.lessonId": lessonId },
        { "lessons.lessonId": new ObjectId(lessonId) }
      ]
    }).toArray();

    let enrolment = 0;
    orders.forEach(function (order) {
      (order.lessons || []).forEach(function (item) {
        if (String(item.lessonId) === String(lessonId)) {
          enrolment += Number(item.spaces) || 0;
        }
      });
    });

    res.json({
      lessonId: lessonId,
      enrolment: enrolment
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load enrolment" });
  }
});

app.post("/orders", async function (req, res) {
  try {
    const name = req.body.name;
    const phone = req.body.phone;
    const lessons = req.body.lessons;

    if (!name || !phone || !Array.isArray(lessons) || lessons.length === 0) {
      return res.status(400).json({
        error: "Order requires name, phone, and a lessons array"
      });
    }

    const order = {
      name: name,
      phone: phone,
      lessons: lessons,
      createdAt: new Date()
    };

    const result = await db.collection("orders").insertOne(order);
    res.status(201).json({
      message: "Order saved",
      orderId: result.insertedId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save order" });
  }
});

// PUT can update any lesson attribute (not only increment/decrement space).
app.put("/lessons/:id", async function (req, res) {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid lesson id" });
    }

    const updates = Object.assign({}, req.body);
    delete updates._id;

    if (updates.space !== undefined) {
      updates.space = Number(updates.space);
    }
    if (updates.price !== undefined) {
      updates.price = Number(updates.price);
    }
    if (updates.teacherId && isValidObjectId(updates.teacherId)) {
      updates.teacherId = new ObjectId(updates.teacherId);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const result = await db.collection("lessons").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update lesson" });
  }
});

async function start() {
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI. Copy .env.example to .env and add your Atlas connection string.");
    process.exit(1);
  }

  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log("Connected to MongoDB database: " + DB_NAME);

  app.listen(PORT, function () {
    console.log("Express server listening on port " + PORT);
  });
}

start().catch(function (err) {
  console.error("Failed to start server", err);
  process.exit(1);
});
