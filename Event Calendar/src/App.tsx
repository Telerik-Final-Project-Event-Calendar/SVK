// import React, { useState, useEffect } from "react";
// import "./App.css";
// import { ref, set, onValue } from "firebase/database";
// import { db } from "./config/firebase-config";

// //just for test the Firebase
// function App() {
//   const [count, setCount] = useState<number>(0);
//   const [message, setMessage] = useState<string>("");

//   useEffect(() => {
//     set(ref(db, "welcomeMessage"), "Hello from React & Firebase!");
//     console.log("Message written to Firebase Realtime Database.");

//     const messageRef = ref(db, "welcomeMessage");
//     onValue(messageRef, (snapshot) => {
//       const data = snapshot.val();
//       setMessage(data);
//       console.log("Message read from Firebase:", data);
//     });

//     return () => {};
//   }, []);

//   const increment = () => {
//     setCount((prevCount) => prevCount + 1);
//   };

//   return (
//     <div className="App">
//       <h1>Vite + React + TypeScript!</h1>
//       <p>Count: {count}</p>
//       <button onClick={increment}>Increment</button>
//       <hr />
//       <h2>Firebase Message:</h2>
//       <p>{message ? message : "Loading message from Firebase..."}</p>
//     </div>
//   );
// }

// export default App;
