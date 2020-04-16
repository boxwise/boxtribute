import React from 'react';
import ScanBox from './ScanBox';

function Home() {
  return (
    <div>
      <h2 className ='w-screen flex justify-center p-2 bg-blue-500' >Welcome to boxwise!</h2>
      <ScanBox />
    </div>
  )
}

export default Home;
