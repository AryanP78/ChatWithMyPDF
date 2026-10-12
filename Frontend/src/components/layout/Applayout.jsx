import React from "react";
import Header from "./Header";

const Applayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-7xl">{children}</main>
    </div>
  );
};

export default Applayout;
