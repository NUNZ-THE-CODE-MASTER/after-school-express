const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "afterSchool";

const teacherDocs = [
  { _id: new ObjectId("66f000000000000000000001"), firstName: "Amira", lastName: "Hassan" },
  { _id: new ObjectId("66f000000000000000000002"), firstName: "James", lastName: "Okafor" },
  { _id: new ObjectId("66f000000000000000000003"), firstName: "Priya", lastName: "Patel" },
  { _id: new ObjectId("66f000000000000000000004"), firstName: "Daniel", lastName: "Cole" },
  { _id: new ObjectId("66f000000000000000000005"), firstName: "Sofia", lastName: "Marin" }
];

const lessonDocs = [
  { topic: "Math", location: "Hendon", price: 100, space: 5, image: "math.svg", teacherId: teacherDocs[0]._id },
  { topic: "Math", location: "Colindale", price: 80, space: 5, image: "math.svg", teacherId: teacherDocs[0]._id },
  { topic: "English", location: "Brent Cross", price: 90, space: 5, image: "english.svg", teacherId: teacherDocs[1]._id },
  { topic: "English", location: "Golders Green", price: 95, space: 5, image: "english.svg", teacherId: teacherDocs[1]._id },
  { topic: "Science", location: "Hendon", price: 110, space: 5, image: "science.svg", teacherId: teacherDocs[2]._id },
  { topic: "Music", location: "Colindale", price: 70, space: 5, image: "music.svg", teacherId: teacherDocs[3]._id },
  { topic: "Football", location: "Brent Cross", price: 60, space: 5, image: "football.svg", teacherId: teacherDocs[4]._id },
  { topic: "Art", location: "Golders Green", price: 85, space: 5, image: "art.svg", teacherId: teacherDocs[3]._id },
  { topic: "Coding", location: "Hendon", price: 120, space: 5, image: "coding.svg", teacherId: teacherDocs[2]._id },
  { topic: "Drama", location: "Colindale", price: 75, space: 5, image: "drama.svg", teacherId: teacherDocs[4]._id },
  { topic: "Chess", location: "Brent Cross", price: 55, space: 5, image: "chess.svg", teacherId: teacherDocs[0]._id },
  { topic: "Swimming", location: "Golders Green", price: 65, space: 5, image: "swimming.svg", teacherId: teacherDocs[4]._id }
];

async function seed() {
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI. Copy .env.example to .env first.");
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  await db.collection("teachers").deleteMany({});
  await db.collection("lessons").deleteMany({});
  await db.collection("orders").deleteMany({});

  await db.collection("teachers").insertMany(teacherDocs);
  await db.collection("lessons").insertMany(lessonDocs);

  console.log("Seeded " + teacherDocs.length + " teachers and " + lessonDocs.length + " lessons into " + DB_NAME);
  await client.close();
}

seed().catch(function (err) {
  console.error(err);
  process.exit(1);
});
