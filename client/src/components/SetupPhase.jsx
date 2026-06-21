import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router';
import NetworkMap from './NetworkMap.jsx';

function SetupPhase({ network, onStart }) {
    return (
        <Container className="py-4">
            <h2 className="mb-3">Study the network</h2>
            <p className="text-muted mb-3">Memorize the lines and stations before your route is assigned.</p>
            <NetworkMap network={network} startStation={null} destinationStation={null} showLines={true} />
            <div className="d-flex justify-content-center gap-3 mt-4">
                <Button variant="outline-secondary" size="lg" as={Link} to="/">
                    <i className="bi bi-house me-2" />Go home
                </Button>
                <Button variant="primary" size="lg" onClick={onStart}>
                    <i className="bi bi-play-fill me-2" />Start game
                </Button>
            </div>
        </Container>
    );
}

export default SetupPhase;
