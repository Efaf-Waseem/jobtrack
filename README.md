# JobTrack

A full-stack job application tracker. Add the jobs you apply to and move them through each stage of the hiring process on a simple board.

## Features
- Add an application with job title, company and date
- Board with four stages: Applied, Interview, Offer, Rejected
- Move an application to the next stage, or delete it
- Live stats for total applications, interviews, offers and rejections
- All data saved in a MongoDB database

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas with Mongoose

## API
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/jobs | List all applications |
| POST | /api/jobs | Add an application |
| PUT | /api/jobs/:id | Update an application (for example its status) |
| DELETE | /api/jobs/:id | Delete an application |

## Run Locally
1. Clone the repository
2. Go into the server folder and install packages:
   `cd server` then `npm install`
3. Create a file `server/.env` and add your MongoDB connection string:
   `MONGO_URI=your_mongodb_connection_string`
4. Start the server: `node server.js`
5. Open `index.html` with Live Server

## Author
Built by Ifaf Waseem