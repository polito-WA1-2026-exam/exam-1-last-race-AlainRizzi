import { useContext } from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router';
import UserContext from '../contexts/UserContext.jsx';

function HomePage() {
    const { user } = useContext(UserContext);

    return (
        <Container className="py-5">
            <h1 className="mb-2">Last Race <i className="bi bi-train-front-fill" /></h1>
            <p className="lead text-muted mb-5">Plan your underground route before time runs out and score as many coins as possible.</p>

            <div className="text-start mx-auto mb-5" style={{ maxWidth: 680 }}>
                <h4 className="mb-3">How to play</h4>
                <ol className="ps-3">
                    <li className="mb-3">
                        <strong>Setup</strong> — Study the full metro network map with all lines and stations before starting.
                    </li>
                    <li className="mb-3">
                        <strong>Planning</strong> — You are assigned a start and a destination station. You have <strong>90 seconds</strong> to build your route by selecting connected segments from the list.
                    </li>
                    <li className="mb-3">
                        <strong>Execution</strong> — Your route is validated. For each segment a random event applies a coin bonus or penalty, revealed step by step.
                    </li>
                    <li className="mb-3">
                        <strong>Result</strong> — Your remaining coins are your score. Every game starts with <strong>20 coins</strong>. An invalid or incomplete route scores zero.
                    </li>
                </ol>
            </div>

            <div className="d-flex gap-3 justify-content-center">
                {user?.id
                    ? <>
                        <Button as={Link} to="/game" variant="primary" size="lg">
                            <i className="bi bi-play-fill me-2" />Start a new game
                        </Button>
                        <Button as={Link} to="/ranking" variant="outline-secondary" size="lg">
                            <i className="bi bi-trophy me-2" />View ranking
                        </Button>
                      </>
                    : <Button as={Link} to="/login" variant="primary" size="lg">
                        <i className="bi bi-box-arrow-in-right me-2" />Login to play
                      </Button>
                }
            </div>
        </Container>
    );
}

export default HomePage;
