import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Header, Input } from "semantic-ui-react";

function Home() {
  const { isAuthenticated, user } = useAuth0();

  return (
    <div className="home">
      <Header as="h2" textAlign="center" className="brandBlue">
        Welcome to boxwise, {isAuthenticated ? user.name : `please log in`}.
      </Header>

      {isAuthenticated ? (
        <div>
          <div className="child1">
            <div>
              <Header as="h2" className="brandBlue">
                FIND BOXES
              </Header>
              <Input size="large" className="brandBlue" action="Search" placeholder="Search..." />
            </div>
          </div>

          <div className="child2">
            <Header as="h2" className="white">
              ORDERS
            </Header>
            <div className="card">
              <div className="column-less">
                <h3>
                  3
                  <br />
                  boxes
                </h3>
              </div>
              <div className="column">
                <p className="brandBlue">Ordered 4 hours ago by Samantha S.</p>
              </div>
            </div>

            <div className="card">
              <div className="column-less">
                <h3 className="brandBlue">
                  3<br></br> boxes
                </h3>
              </div>
              <div className="column">
                <p>Ordered 4 hours ago by Samantha S.</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Home;
