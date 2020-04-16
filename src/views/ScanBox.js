import React, { useState } from 'react';
import QrReader from 'react-qr-reader';
// import {Link} from "react-router-dom";

function ScanBox() {
  const [data, setData] = useState('')

  return (
    <div>
      <h2>Scan a box now:</h2>
      {data ? 
      <div>
        <a href={data}>{data}</a> 
        <br />
        <button 
        onClick={()=>setData('')}
        className="m-1 bg-red-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button"
        >Scan again</button>
      </div>
      :
      <QrReader
          delay={300}
          onError={(err) => console.log(err)}
          onScan={setData}
          style={{ width: '100%' }}
        />}

        {/* <Link 
        to='/'
        className="m-1 leading-loose bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button"
        >
          Go Home
        </Link> */}
    </div>
  )
}

export default ScanBox;
