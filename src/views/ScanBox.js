import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ScanBox({authObject}) {
  const [data, setData] = useState({})

  useEffect(() => {
    async function fetchData(){
      // Auth0 is pretty full-service, so we only have to worry about sending the auth token, and it will take care of the rest
      // no refresh token cookie needed
    const result = await axios(
      'http://localhost:5000/api/private',
      {
        headers: {
          Authorization: `Bearer ${authObject.access_token}`
        }
      }
    );
    setData(result.data);
  }
  fetchData();
  }, [authObject]);

  return (
    <div>
      <h2>Scan a box now:</h2>
      <p>{data.message}</p>

    </div>
  )
}

export default ScanBox;
