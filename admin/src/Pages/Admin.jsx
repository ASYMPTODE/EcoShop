import React, { Suspense, lazy } from "react";
import "./CSS/Admin.css";
import Sidebar from "../Components/Sidebar/Sidebar";
import { Route, Routes, Navigate } from "react-router-dom";

// Lazy load admin components
const AddProduct = lazy(() => import("../Components/AddProduct/AddProduct"));
const ListProduct = lazy(() => import("../Components/ListProduct/ListProduct"));

const Admin = () => {

  return (
    <div className="admin">
      <Sidebar />
      <Suspense fallback={<div className="loading">Loading component...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/listproduct" replace />} />
          <Route path="/addproduct" element={<AddProduct />} />
          <Route path="/listproduct" element={<ListProduct />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default Admin;
