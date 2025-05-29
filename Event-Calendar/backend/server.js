const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config(); 

const admin = require("firebase-admin");

let serviceAccount;

if (
  process.env.NODE_ENV === "production" &&
  process.env.FIREBASE_ADMIN_SDK_KEY
) {
  serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY);
} else {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY);
  } catch (e) {
    console.error(
      "Error parsing FIREBASE_ADMIN_SDK_KEY from .env. Make sure it's a valid JSON string."
    );
    console.error(
      "Attempting to load from local serviceAccountKey.json (if present)."
    );
    try {
      serviceAccount = require("./serviceAccountKey.json");
    } catch (fileError) {
      console.error(
        "serviceAccountKey.json not found or invalid. Firebase Admin SDK will not initialize."
      );
      serviceAccount = null; 
    }
  }
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL:
      "https://svk-event-calendar-default-rtdb.europe-west1.firebasedatabase.app",
  });
} else {
  console.error(
    "Firebase Admin SDK Service Account Key is missing or invalid. Admin SDK will not be initialized."
  );
  // process.exit(1);
}

const db = serviceAccount ? admin.database() : null;

const app = express();
const port = process.env.PORT || 5000;
const upload = multer();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://svk-event-calendar.web.app/"],
    methods: "POST, GET",
  })
);
app.use(express.json());

const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

app.post("/api/upload-image", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided." });
  }

  if (!IMGBB_API_KEY) {
    return res
      .status(500)
      .json({ error: "Imgbb API key not configured on the server." });
  }

  const formData = new FormData();
  formData.append("image", req.file.buffer.toString("base64"));

  try {
    const response = await axios.post(
      "https://api.imgbb.com/1/upload",
      formData,
      {
        params: {
          key: IMGBB_API_KEY,
        },
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
        },
      }
    );

    if (
      response.data &&
      response.data.success &&
      response.data.data &&
      response.data.data.url
    ) {
      res.json({ imageUrl: response.data.data.url });
    } else {
      console.error("Imgbb upload failed:", response.data);
      res.status(500).json({ error: "Imgbb upload failed." });
    }
  } catch (error) {
    console.error("Error uploading to Imgbb:", error);
    res.status(500).json({ error: "Failed to upload image via Imgbb." });
  }
});

// const normalizeDate = (timestampOrDateString) => {
//   let date;
//   if (typeof timestampOrDateString === "number") {
//     date = new Date(timestampOrDateString);
//   } else {
//     date = new Date(timestampOrDateString);
//   }
//   if (isNaN(date.getTime())) {
//     return null;
//   }
//   return date.toISOString().split("T")[0];
// };

// app.get("/api/stats/users-over-time", async (req, res) => {
//   if (!db) {
//     return res
//       .status(500)
//       .json({ error: "Firebase Admin SDK not initialized." });
//   }
//   try {
//     const usersRef = db.ref("users");
//     const snapshot = await usersRef.once("value");
//     const usersData = snapshot.val();

//     if (!usersData) {
//       return res.json([]);
//     }

//     const countsByDate = {};
//     Object.values(usersData).forEach((user) => {
//       if (user.createdOn) {
//         const date = normalizeDate(user.createdOn);
//         if (date) {
//           countsByDate[date] = (countsByDate[date] || 0) + 1;
//         }
//       }
//     });

//     const chartData = Object.keys(countsByDate)
//       .map((date) => ({
//         date: date,
//         value: countsByDate[date],
//       }))
//       .sort((a, b) => new Date(a.date) - new Date(b.date));

//     res.json(chartData);
//   } catch (error) {
//     console.error("Error fetching users over time:", error);
//     res.status(500).json({ error: "Failed to fetch user trend data." });
//   }
// });

// app.get("/api/stats/posts-over-time", async (req, res) => {
//   if (!db) {
//     return res
//       .status(500)
//       .json({ error: "Firebase Admin SDK not initialized." });
//   }
//   try {
//     const postsRef = db.ref("posts");
//     const snapshot = await postsRef.once("value");
//     const postsData = snapshot.val();

//     if (!postsData) {
//       return res.json([]);
//     }

//     const countsByDate = {};
//     Object.values(postsData).forEach((post) => {
//       if (post.createdOn) {
//         const date = normalizeDate(post.createdOn);
//         if (date) {
//           countsByDate[date] = (countsByDate[date] || 0) + 1;
//         }
//       }
//     });

//     const chartData = Object.keys(countsByDate)
//       .map((date) => ({
//         date: date,
//         value: countsByDate[date],
//       }))
//       .sort((a, b) => new Date(a.date) - new Date(b.date));

//     res.json(chartData);
//   } catch (error) {
//     console.error("Error fetching posts over time:", error);
//     res.status(500).json({ error: "Failed to fetch post trend data." });
//   }
// });

// app.get("/api/stats/comments-over-time", async (req, res) => {
//   if (!db) {
//     return res
//       .status(500)
//       .json({ error: "Firebase Admin SDK not initialized." });
//   }
//   try {
//     const commentsRef = db.ref("comments");
//     const snapshot = await commentsRef.once("value");
//     const commentsData = snapshot.val();

//     if (!commentsData) {
//       return res.json([]);
//     }

//     const countsByDate = {};
//     Object.values(commentsData).forEach((comment) => {
//       if (comment.createdOn) {
//         const date = normalizeDate(comment.createdOn);
//         if (date) {
//           countsByDate[date] = (countsByDate[date] || 0) + 1;
//         }
//       }
//     });

//     const chartData = Object.keys(countsByDate)
//       .map((date) => ({
//         date: date,
//         value: countsByDate[date],
//       }))
//       .sort((a, b) => new Date(a.date) - new Date(b.date));

//     res.json(chartData);
//   } catch (error) {
//     console.error("Error fetching comments over time:", error);
//     res.status(500).json({ error: "Failed to fetch comment trend data." });
//   }
// });

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});
