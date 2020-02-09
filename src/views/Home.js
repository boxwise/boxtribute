import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
      <h2>Welcome to boxwise, please log in</h2>
      <p>{data.message}</p>
    </div>
  )
}

export default Home;
