# After School Classes — Express.js API

CST3144 back-end: Node.js, Express.js, and the native MongoDB driver (no Mongoose).

## Links (fill these in before submission)

- GitHub repository: `https://github.com/YOUR_USERNAME/after-school-express`
- Render lessons route: `https://YOUR_STUDENT_NUMBER-after-school.onrender.com/lessons`

## Local setup

1. Copy `.env.example` to `.env`.
2. Put your MongoDB Atlas connection string in `MONGODB_URI`.
3. Install and seed:

```
npm install
npm run seed
npm start
```

The API listens on `http://localhost:3000`.

## Routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/lessons` | All lessons |
| GET | `/lessons?teacherId=` | Lessons taught by one teacher |
| GET | `/search?q=` | Search topic, location, price, spaces |
| POST | `/orders` | Save an order |
| PUT | `/lessons/:id` | Update any lesson field |
| GET | `/teachers` | All teachers |
| GET | `/enrolment/:lessonid` | Spaces already purchased |
| GET | `/images/:filename` | Lesson image, or JSON error if missing |

## Render.com hosting

1. Push this folder to its own GitHub repository (at least 10 commits).
2. Create a Web Service on Render from that repo.
3. Name the service so the URL includes your student number, for example `M001234567-after-school`.
4. Set environment variables: `MONGODB_URI`, `DB_NAME=afterSchool`.
5. Build command: `npm install`. Start command: `npm start`.
6. After deploy, run seed once (Render shell, or run `npm run seed` locally against the same Atlas database).

## Demo notes

- Logger output appears in the Render logs: method, URL, and timestamp for every request.
- Request a missing image such as `/images/does-not-exist.png` to show the error JSON.
