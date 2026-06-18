import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router';

function ResultPhase({ game, onPlayAgain }) {
    const { result } = game;

    return (
        <Container className="py-5 d-flex justify-content-center">
            <div className="border rounded-3 shadow-sm p-4 p-md-5 text-center" style={{ minWidth: 320 }}>
                <i className={`bi ${result.valid ? 'bi-trophy-fill text-warning' : 'bi-x-circle-fill text-danger'} display-3 mb-3 d-block`} />
                <h2 className="mb-1">{result.valid ? 'Route valid!' : 'Invalid route'}</h2>
                <p className="text-muted mb-4">
                    {game.startStation.name} <i className="bi bi-arrow-right mx-1" /> {game.destinationStation.name}
                </p>
                <p className="display-5 fw-bold mb-4">
                    {result.finalScore} <span className="fs-5 fw-normal text-muted">coins</span>
                </p>
                <div className="d-flex gap-2 justify-content-center">
                    <Button variant="primary" onClick={onPlayAgain}>
                        <i className="bi bi-arrow-repeat me-2" />Play again
                    </Button>
                    <Button variant="outline-secondary" as={Link} to="/">
                        <i className="bi bi-house me-2" />Go home
                    </Button>
                </div>
            </div>
        </Container>
    );
}

export default ResultPhase;
