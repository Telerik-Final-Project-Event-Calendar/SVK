import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppProvider from "./providers/AppProvider";
import Authenticated from "./hoc/Authenticated";

import Header from "./components/Header/Header";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import HomePage from "./pages/HomePage/HomePage";
import { CalendarProvider } from "./providers/CalendarProvider";
import AdminPanel from "./pages/Admin/AdminPanel";
import AdminOnly from "./hoc/AdminOnly";
import EventDetails from "./pages/EventDetails/EventDetails";
import UserEvents from "./components/UserEvents/UserEvents";
import EditEvent from "./pages/EditEvent/EditEvent";
import EventsPage from "./pages/EventsPage/EventsPage";
// import ContactsPage from "./components/ContactsPage/ContactsPage";
import AboutUs from "./components/AboutUs/AboutUs";
import ContactsPageNew from "./pages/ContactsPageNew/ContactsPageNew";

const CreateEvent: React.FC = () => (
  <div>
    <h2>Create New Event</h2>
    <p>Event Creation Form Here</p>
  </div>
);

const PageNotFound: React.FC = () => (
  <div>
    <h2>404 - Page Not Found</h2>
    <p>The page you are looking for does not exist.</p>
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <CalendarProvider>
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
              {/* <Route
                path="/contacts"
                element={
                  <Authenticated>
                    <ContactsPage />
                  </Authenticated>
                }
              /> */}
              <Route
                path="/events"
                element={
                  <Authenticated>
                    <UserEvents />
                  </Authenticated>
                }
              />
              <Route path="/all-events" element={<EventsPage />} />
              <Route path="/event/:eventId" element={<EventDetails />} />
              <Route
                path="/event/edit/:id"
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
              <Route
                path="/admin"
                element={
                  <AdminOnly>
                    <AdminPanel />
                  </AdminOnly>
                }
              />

              <Route path="about-us" element={<AboutUs />} />

              <Route
                path="/contacts-new"
                element={
                  <Authenticated>
                    <ContactsPageNew />
                  </Authenticated>
                }
              />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </main>
        </CalendarProvider>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
