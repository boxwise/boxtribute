import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h2 className="w-screen flex justify-center p-2 bg-blue-500">
        Welcome to boxwise! Please log in.
      </h2>
      <Link to="/org/abc">Org ABC</Link>
      <br />
      <Link to="/org/abc/base/base1">Org ABC, Base 1</Link>
      <br />
      <Link to="/org/abc/base/base1/pick-list">Org ABC, Base 1, pick list</Link>
    </div>
  );
}

export default Home;
