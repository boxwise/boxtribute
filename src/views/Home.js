import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Link} from "react-router-dom";

function Home() {
  const [data, setData] = useState({})

  useEffect(() => {
    async function fetchData(){
    const result = await axios(
      'http://localhost:5000/api/public',
    );
    setData(result.data);
  }
  fetchData();
  }, []);

  return (
    <div>
      <h2>Welcome to boxwise!</h2>
      <p>{data.message}</p>
      <Link to='/org/abc'>Org ABC</Link>
      <br />
      <Link to='/org/abc/base/base1'>Org ABC, Base 1</Link>
    </div>
  )
}

export default Home;
