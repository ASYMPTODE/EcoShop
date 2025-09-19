import React, { Suspense, lazy } from "react";
import { BrowserRouter } from "react-router-dom";
import Footer from "./Components/Footer/Footer";
import Navbar from "./Components/Navbar/Navbar";

// Lazy load Admin component
const Admin = lazy(() => import("./Pages/Admin"));

export const backend_url = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
export const currency = '₹';

function App() {
  return (
    <BrowserRouter>
      <div>
        <Navbar />
        <Suspense fallback={<div className="loading">Loading...</div>}>
          <Admin />
        </Suspense>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
