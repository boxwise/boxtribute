import React from "react";
import UserContext from "../UserContext"

function Home() {
  const userObject = React.useContext(UserContext)
  const user = userObject.name
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
        </div>
      )}
    </div>
  );
}

export default Home;
