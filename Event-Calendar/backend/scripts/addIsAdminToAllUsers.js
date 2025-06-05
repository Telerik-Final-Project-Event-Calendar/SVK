const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://svk-event-calendar-default-rtdb.europe-west1.firebasedatabase.app",
});

const db = admin.database();

async function addIsAdminToAllUsers() {
  const usersRef = db.ref("users");

  try {
    const snapshot = await usersRef.once("value");

    if (snapshot.exists()) {
      const updates = {};

      snapshot.forEach(child => {
        const user = child.val();
        if (user.isAdmin === undefined) {
          updates[`${child.key}/isAdmin`] = false;
        }
      });

      if (Object.keys(updates).length > 0) {
        await usersRef.update(updates);
        console.log("Added isAdmin: false.");
      } else {
        console.log("All users have isAdmin.");
      }
    } else {
      console.log("No users.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

addIsAdminToAllUsers();
