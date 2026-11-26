# After School Classes - Express.js API

CST3144 back-end: Node.js, Express.js and the native MongoDB driver (no Mongoose). Data is stored in MongoDB Atlas and the API is hosted on Render.

## Links

- GitHub repository: https://github.com/NUNZ-THE-CODE-MASTER/after-school-express
- Render lessons route: https://m00956871-after-school.onrender.com/lessons
- Front-end repository: https://github.com/NUNZ-THE-CODE-MASTER/after-school-vue
- Front-end (GitHub Pages): https://NUNZ-THE-CODE-MASTER.github.io/after-school-vue/

## Project structure

- `server.js` - Express server: middleware, routes and MongoDB connection
- `seed.js` - fills the `teachers` and `lessons` collections
- `public/images/` - lesson images, served at `/images`
- `.env.example` - template for the environment variables
- `render.yaml` - Render service configuration

## Local setup

1. Copy `.env.example` to `.env`.
2. Put your MongoDB Atlas connection string in `MONGODB_URI`. `DB_NAME` defaults to `afterSchool`. Never commit `.env`.
3. Install, seed and start:

```
npm install
npm run seed
npm start
```

The API listens on `http://localhost:3000` (or on `PORT` if it is set).

`npm run seed` deletes every document in `teachers`, `lessons` and `orders`, then inserts 5 teachers and 12 lessons with 5 spaces each. Run it again to reset the data.

## Database (MongoDB Atlas, database `afterSchool`)

| Collection | Fields |
| --- | --- |
| `lessons` | `topic`, `location`, `price`, `space`, `image`, `teacherId` |
| `orders` | `name`, `phone`, `lessons` (array of `{ lessonId, spaces }`), `createdAt` |
| `teachers` | `firstName`, `lastName` |

Each lesson points to its teacher through `teacherId`, so one teacher can teach several lessons.

## Middleware

- **Logger:** prints `[ISO timestamp] METHOD url` for every request to the console. On Render these lines appear in the service logs, with timestamps in UTC.
- **Static images:** `express.static` serves `public/images` at `/images`. If the file does not exist, the next handler returns a 404 with a JSON error message.
- `cors()` allows the GitHub Pages site to call the API, and `express.json()` parses JSON request bodies.

## Routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/lessons` | All lessons |
| GET | `/lessons?teacherId=` | Lessons taught by one teacher |
| GET | `/search?q=` | Case-insensitive search across topic, location, price and spaces |
| POST | `/orders` | Save an order (201 on success, 400 if name, phone or lessons are missing) |
| PUT | `/lessons/:id` | Update any lesson field, for example `{ "space": 3 }` (400 for an invalid id, 404 if not found) |
| GET | `/teachers` | All teachers |
| GET | `/enrolment/:lessonid` | Spaces already purchased for a lesson: `{ lessonId, enrolment }` |
| GET | `/images/:filename` | Lesson image, or a 404 JSON error if it does not exist |

Example order body:

```
{
  "name": "Jane Parent",
  "phone": "+23057123456",
  "lessons": [{ "lessonId": "<lesson _id>", "spaces": 1 }]
}
```

## Render hosting

- The API runs as a Render Web Service named `m00956871-after-school`, so the URL includes the student number.
- Environment variables: `MONGODB_URI` and `DB_NAME=afterSchool`.
- Build command: `npm install`. Start command: `npm start`.
- Each push to `main` redeploys the service.
- The free tier sleeps when idle, so the first request after a break can take about a minute.
- The seed is run locally against the same Atlas database (`npm run seed`).

## Demo notes

- Logger output appears in the Render logs: timestamp, method and URL for every request.
- Request a missing image such as `/images/does-not-exist.png` to show the JSON error.
- Request a valid image such as `/images/art.svg` to show the file being served.