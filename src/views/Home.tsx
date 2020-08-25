import React from "react";
import { Link } from "react-router-dom";
import AuthContext from "../AuthContext";
import { Header, Segment,  Card, Input} from 'semantic-ui-react';


function Home() {
  const authObject = React.useContext(AuthContext)
  const user = authObject.idTokenPayload.name

  return (
    <div className='home'>
      <Header as='h2' textAlign='center' className='brandBlue'>
        Welcome to boxwise, {user ? user : `please log in`}.
      </Header>

      { user
      ? <div>
          <div className='child1'>
            <div>
              <Header as='h2' className='brandBlue'>FIND BOXES</Header>
            <Input size='large' className='brandBlue' action='Search' placeholder='Search...'  />
            </div>
          </div>
    
          <div className='child2'>
            <Header as='h2' className='white'>ORDERS</Header>
            <div className='card'>
              <div className='column-less'>
              <h3>3 <br></br>boxes</h3> 
              </div>
              <div className='column'>
              <p className='brandBlue'>Ordered 4 hours ago by Samantha S.</p>
              </div>
          </div>

            <div className='card'>
              <div className='column-less'>
              <h3 className='brandBlue'>3<br></br> boxes</h3> 
              </div>
              <div className='column'>
              <p>Ordered 4 hours ago by Samantha S.</p>
              </div>
            </div>
          </div>
    </div>
      : null }



    
      
    </div> 
  );
}

export default Home;
// {!user && <p className="p-6 text-gray-800">Please Sign In</p>}
//       {user && (
//         <div className="p-6">
//           <Link  to="/org/100000000">
//             {`->`} Info About A Single Base You Belong To
//           </Link>
//           <br />
//           <Link  to="/org/123">
//             {`->`} Info About A Single Base You Do Not Belong To
//           </Link>
//           <br />
//           <Link to="/org/all">
//             {`->`} List All Bases (everyone logged in can do this)
//           </Link>
//           <br />
//           <Link to="/pdf">
//             {`->`} Generate QR Codes
//           </Link>
//         </div>
//       )}