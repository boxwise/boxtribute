import React from "react";
import AuthContext from "../AuthContext"
import { Link } from "react-router-dom";


function Home() {
  const authObject = React.useContext(AuthContext)
  const user = authObject.idTokenPayload.name
  return (
    <div>
      <h2 className="w-screen flex justify-center p-2 bg-blue-500">
        Welcome to boxwise, {user || `please log in`}.
      </h2>
      {!user && <p className="p-6 text-gray-800">Please Sign In</p>}
      {user && (
        <div className="p-6">
          <h4>find boxes</h4>
          <h4>orders</h4>
          <Link to="create-box">create box</Link>
        </div>
      )}
    </div>
  );
}

export default Home;
