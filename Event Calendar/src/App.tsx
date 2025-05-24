import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppProvider from './providers/AppProvider'; 
import Authenticated from './hoc/Authenticated'; 

import Header from './components/Header/Header';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword'; 

const HomePage: React.FC = () => <div><h1>Welcome to Event Calendar!</h1><p>Home Page Content</p></div>;
const CreateEvent: React.FC = () => <div><h2>Create New Event</h2><p>Event Creation Form Here</p></div>;
const MyEvents: React.FC = () => <div><h2>My Events</h2><p>List of user's events</p></div>;
const AllEvents: React.FC = () => <div><h2>All Events</h2><p>List of all public events</p></div>;
const EventDetails: React.FC = () => <div><h2>Event Details</h2><p>Specific event information</p></div>;
const EditEvent: React.FC = () => <div><h2>Edit Event</h2><p>Edit event form</p></div>;
const PageNotFound: React.FC = () => <div><h2>404 - Page Not Found</h2><p>The page you are looking for does not exist.</p></div>;

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <Header /> 
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/create-event"
              element={
                <Authenticated>
                  <CreateEvent />
                </Authenticated>
              }
            />
            <Route
              path="/my-events"
              element={
                <Authenticated>
                  <MyEvents />
                </Authenticated>
              }
            />
            <Route
              path="/all-events"
              element={
                <Authenticated>
                  <AllEvents />
                </Authenticated>
              }
            />
            <Route
              path="/events/:id"
              element={
                <Authenticated>
                  <EventDetails />
                </Authenticated>
              }
            />
            <Route
              path="/events/edit/:id"
              element={
                <Authenticated>
                  <EditEvent />
                </Authenticated>
              }
            />
            <Route
              path="/profile"
              element={
                <Authenticated>
                  <ProfilePage />
                </Authenticated>
              }
            />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
              <div className="text-3xl font-bold text-red-500">
      Tailwind is working!
    </div>
        </main>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;