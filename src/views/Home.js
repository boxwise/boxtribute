import React from "react";
import { Link } from "react-router-dom";

function Home({ user }) {
  return (
    <div>
      <h2 className="w-screen flex justify-center p-2 bg-blue-500">
        Welcome to boxwise, {user ? user : `please log in`}.
      </h2>
      {!user && <p className="p-6 text-gray-800">Please Sign In</p>}
      {user && (
        <div className="p-6">
          <Link className="text-blue-900 hover:bg-blue-200" to="/org/100000000">
            -> Info About A Single Base You Belong To
          </Link>
          <br />
          <Link className="text-blue-900 hover:bg-blue-200" to="/org/123">
            -> Info About A Single Base You Do Not Belong To
          </Link>
          <br />
          <Link className="text-blue-900 hover:bg-blue-200" to="/org/all">
            -> List All Bases (everyone logged in can do this)
          </Link>
          <br />
          <Link className="text-blue-900 hover:bg-blue-200" to="/pdf">
            -> Generate QR Codes
          </Link>
        </div>
      )}
    </div>
  );
}

export default Home;
