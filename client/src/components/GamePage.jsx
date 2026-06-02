import { useState, useEffect } from 'react';
import { Container, Button, Spinner, Alert } from 'react-bootstrap';
import { getNetwork, startGame } from '../api/api.js';
import NetworkMap from './NetworkMap.jsx';

function GamePage() {
    const [phase, setPhase] = useState('setup');
    const [network, setNetwork] = useState([]);
    const [game, setGame] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getNetwork()
            .then(data => setNetwork(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleStart = async () => {
        setError('');
        try {
            const g = await startGame();
            setGame(g);
            setPhase('planning');
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <Container className="py-5"><Spinner animation="border" /></Container>;
    if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

    if (phase === 'setup') {
        return (
            <Container className="py-4">
                <h2 className="mb-3">Study the network</h2>
                <p className="text-muted mb-3">Memorize the lines and stations before your route is assigned.</p>
                <NetworkMap network={network} />
                <div className="text-center mt-4">
                    <Button variant="primary" size="lg" onClick={handleStart}>
                        <i className="bi bi-play-fill me-2" />Start game
                    </Button>
                </div>
            </Container>
        );
    }

    if (phase === 'planning') {
        return (
            <Container className="py-4">
                <h2 className="mb-1">Plan your route</h2>
                <p className="text-muted">
                    From <strong>{game.startStation.name}</strong> to <strong>{game.destinationStation.name}</strong>
                </p>
                <NetworkMap network={network} startStation={game.startStation.name} destinationStation={game.destinationStation.name} showLines={false} />
                <p className="text-center text-muted mt-3">(Planning UI coming soon)</p>
            </Container>
        );
    }

    return null;
}

export default GamePage;
