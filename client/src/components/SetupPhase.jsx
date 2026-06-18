import { Container, Button } from 'react-bootstrap';
import NetworkMap from './NetworkMap.jsx';

function SetupPhase({ network, onStart }) {
    return (
        <Container className="py-4">
            <h2 className="mb-3">Study the network</h2>
            <p className="text-muted mb-3">Memorize the lines and stations before your route is assigned.</p>
            <NetworkMap network={network} startStation={null} destinationStation={null} showLines={true} />
            <div className="text-center mt-4">
                <Button variant="primary" size="lg" onClick={onStart}>
                    <i className="bi bi-play-fill me-2" />Start game
                </Button>
            </div>
        </Container>
    );
}

export default SetupPhase;
