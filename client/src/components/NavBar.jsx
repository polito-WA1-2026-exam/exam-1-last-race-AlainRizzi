import { useContext } from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { Link } from 'react-router';
import UserContext from '../contexts/UserContext.jsx';

function NavBar({ onLogout }) {
    const { user } = useContext(UserContext);
    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="px-3">
            <Navbar.Brand as={Link} to="/">Last Race</Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse>
                <Nav className="me-auto">
                    {user?.id && <Nav.Link as={Link} to="/ranking">Ranking</Nav.Link>}
                    {user?.id && <Nav.Link as={Link} to="/game">Play</Nav.Link>}
                </Nav>
                <Nav>
                    {user?.id
                        ? <>
                            <Navbar.Text className="me-3">
                                <i className="bi bi-person-fill me-1" />
                                {user.username}
                            </Navbar.Text>
                            <Button variant="outline-light" size="sm" onClick={onLogout}>
                                <i className="bi bi-box-arrow-right me-1" />Logout
                            </Button>
                          </>
                        : <Nav.Link as={Link} to="/login">
                            <i className="bi bi-person me-1" />Login
                          </Nav.Link>
                    }
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default NavBar;
