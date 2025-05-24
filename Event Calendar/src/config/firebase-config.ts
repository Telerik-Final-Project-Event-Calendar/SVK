import { initializeApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database'; 
import { getAuth, Auth } from 'firebase/auth'; 

const firebaseConfig = {
  apiKey: "AIzaSyBRfXrFjLWAbNUh5pdf26YIAv5TivS_zzM",
  authDomain: "svk-event-calendar.firebaseapp.com",
  databaseURL: "https://svk-event-calendar-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "svk-event-calendar",
  storageBucket: "svk-event-calendar.firebasestorage.app",
  messagingSenderId: "97075652114",
  appId: "1:97075652114:web:417e1860a1cf1abe815acb"
};

export const app = initializeApp(firebaseConfig);
export const db: Database = getDatabase(app);
export const auth: Auth = getAuth(app);
