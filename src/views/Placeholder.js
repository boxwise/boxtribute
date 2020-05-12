import React from 'react';
import { useLocation } from 'react-router-dom';

function Placeholder() {
  let { pathname } = useLocation();

  return (
    <div>
      <h2>I am a placeholder page for </h2>
      <p>{pathname}</p>
    </div>
  );
}

export default Placeholder;
