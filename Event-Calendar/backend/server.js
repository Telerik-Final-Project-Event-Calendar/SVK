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
      "https://svk-event-calendar-default-rtdb.europe-west1.firebasedatabase.app/",
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
    origin: ["http://localhost:5173", "https://svk-event-calendar.web.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],  })
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

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});
