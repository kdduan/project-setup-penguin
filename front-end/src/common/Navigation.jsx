import { useState } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "./Navigation.css";

import pokedek from "../assets/pokedek.png";

function Navigation() {
  const [activeKey, setActiveKey] = useState("");
  const handleSelect = (eventKey) => {
    console.log({ eventKey });
    setActiveKey(eventKey);
  };

  return (
    <Navbar bg="transparent" expand="lg" className="mt-4">
      <Container>
        <Navbar.Brand>
          <NavLink to="/">
            <img
              src={pokedek}
              className="d-inline-block align-top"
              alt="Pokedek logo"
              width={150}
            />
          </NavLink>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav
            className="ms-auto"
            onSelect={handleSelect}
            activeKey={activeKey}
          >
            <Nav.Link>
              <NavLink
                eventKey="1"
                className="Navigation__link"
                activeClassName="Navigation__active"
                to="/createdeck"
              >
                CREATE A DECK
              </NavLink>
            </Nav.Link>
            <Nav.Link>
              <NavLink
                eventKey="2"
                className="Navigation__link"
                activeClassName="Navigation__active"
                to="/login"
              >
                LOG IN
              </NavLink>
            </Nav.Link>
            <Nav.Link>
              <NavLink
                eventKey="3"
                className="Navigation__link"
                activeClassName="Navigation__active"
                to="/signup"
              >
                SIGN UP
              </NavLink>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;