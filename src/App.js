import React, { useEffect, useState } from "react";
import Auth0 from "./Auth0";
import Home from './views/Home';
import ScanBox from './views/ScanBox';


function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [authObject, setAuthObject] = useState({})

  useEffect(() => {
    handleLogIn();
  }, []);

  function handleLogOut() {
    setLoggedIn(false);
  }

  function handleLogIn() {
    // Auth0 returns the token in the params of the URL after successful login and redirect
    const totalHash = window.location.hash;
    if (totalHash) {
      // remove leading # and split into components,
      // so now you have ['key1=value1', 'key2=value2']
      const hashArray = totalHash.substr(1).split('&');
      let authObject = {};
      hashArray.forEach((item)=>{
        const keyValArray = item.split('=');
        // turns [key, value] into authObject={key: value}
        authObject[keyValArray[0]]= keyValArray[1]
      });
      // the auth object has many items in it, we generally care about the access_token
      setAuthObject(authObject);
      // this is where you would also handle authorization errors from the API
      (!!authObject.access_token) ? setLoggedIn(true) : setLoggedIn(false)
    }
  }

  return (
      <div>
        {loggedIn ? <ScanBox authObject={authObject}/> : <Home />}
        {loggedIn ? (
          <button onClick={() => handleLogOut()} className="log-in">
            Log Out
          </button>
        ) : (
          <button onClick={() => {
            Auth0.login();
          }} className="log-in">
            Log In
          </button>
        )}
      </div>
  );
}

export default App;