import { useState, useEffect, useRef } from 'react';
import { Container, Button, Spinner, Alert, ListGroup, Badge, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router';
import { getNetwork, startGame, submitRoute } from '../api/api.js';
import NetworkMap from './NetworkMap.jsx';

const TIMER_SECONDS = 90;

function GamePage() {
    const [phase, setPhase] = useState('setup');
    const [network, setNetwork] = useState([]);
    const [segments, setSegments] = useState([]);
    const [game, setGame] = useState(null);
    const [route, setRoute] = useState([]);
    const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
    const [revealedSteps, setRevealedSteps] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const timerRef = useRef(null);

    useEffect(() => {
        setLoading(true);
        getNetwork()
            .then(net => {
                setNetwork(net);
                const segs = net.flatMap(line =>
                    line.Stations.slice(0, -1).map((s, i) => ({ station1: s.name, station2: line.Stations[i + 1].name }))
                );
                // setSegments([...segs].sort(() => Math.random() - 0.5));
                setSegments(segs.sort((a, b) => a.station1.localeCompare(b.station1)));
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (phase !== 'planning') return;
        setTimeLeft(TIMER_SECONDS);
        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) { clearInterval(timerRef.current); return 0; }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [phase]);

    useEffect(() => {
        if (phase === 'planning' && timeLeft === 0) handleSubmit();
    }, [timeLeft]);

    const handleStart = async () => {
        setError('');
        try {
            const g = await startGame();
            setGame(g);
            setRoute([]);
            setRevealedSteps([]);
            setPhase('planning');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleToggleSegment = (seg) => {
        setRoute(prev => {
            const exists = prev.find(s => s.station1 === seg.station1 && s.station2 === seg.station2);
            if (exists) return prev.filter(s => !(s.station1 === seg.station1 && s.station2 === seg.station2));
            return [...prev, seg];
        });
    };

    const handleSubmit = async (expired = false) => {
        clearInterval(timerRef.current);
        setError('');
        try {
            const result = await submitRoute(game.id, route);
            setGame(g => ({ ...g, result }));
            setPhase('execution');
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
                <NetworkMap network={network} startStation={null} destinationStation={null} showLines={true} />
                <div className="text-center mt-4">
                    <Button variant="primary" size="lg" onClick={handleStart}>
                        <i className="bi bi-play-fill me-2" />Start game
                    </Button>
                </div>
            </Container>
        );
    }

    if (phase === 'planning') {
        const timerVariant = timeLeft > 30 ? 'success' : timeLeft > 10 ? 'warning' : 'danger';
        return (
            <Container fluid className="py-4 px-5">
                <Row className="align-items-center mb-3">
                    <Col xs="auto" className="invisible">
                        <Badge className="fs-5 px-3 py-2">
                            <i className="bi bi-clock me-2" />{timeLeft}s
                        </Badge>
                    </Col>
                    <Col className="text-center">
                        <h2 className="mb-0">Plan your route</h2>
                        <p className="text-muted mb-0">
                            From <strong className="text-success">{game.startStation.name}</strong> to <strong className="text-danger">{game.destinationStation.name}</strong>
                        </p>
                    </Col>
                    <Col xs="auto">
                        <Badge bg={timerVariant} className="fs-5 px-3 py-2">
                            <i className="bi bi-clock me-2" />{timeLeft}s
                        </Badge>
                    </Col>
                </Row>

                <Row>
                    <Col md={3} className="mb-4 mb-md-0">
                        <h5 className="mb-2">Your route <span className="text-muted fw-normal fs-6">({route.length})</span></h5>
                        {route.length === 0
                            ? <p className="text-muted">No segments selected yet.</p>
                            : <ListGroup style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                {route.map((seg, i) => (
                                    <ListGroup.Item key={`${seg.station1}-${seg.station2}`} className="d-flex justify-content-between align-items-center">
                                        <span>{seg.station1} <i className="bi bi-arrow-left-right mx-2" /> {seg.station2}</span>
                                        <Badge bg="primary" pill>{i + 1}</Badge>
                                    </ListGroup.Item>
                                ))}
                              </ListGroup>
                        }
                    </Col>
                    <Col md={6} className="mb-4 mb-md-0 d-flex align-items-center justify-content-center">
                        <NetworkMap network={network} startStation={game.startStation.name} destinationStation={game.destinationStation.name} showLines={false} />
                    </Col>
                    <Col md={3}>
                        <h5 className="mb-2">Select segments <span className="text-muted fw-normal fs-6">({route.length} selected)</span></h5>
                        <ListGroup className="mb-3" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            {segments.map(seg => {
                                const index = route.findIndex(s => s.station1 === seg.station1 && s.station2 === seg.station2);
                                const selected = index !== -1;
                                return (
                                    <ListGroup.Item
                                        key={`${seg.station1}-${seg.station2}`}
                                        action
                                        active={selected}
                                        onClick={() => handleToggleSegment(seg)}
                                        className="d-flex justify-content-between align-items-center"
                                    >
                                        <span>{seg.station1} <i className="bi bi-arrow-left-right mx-2" /> {seg.station2}</span>
                                        {selected && <Badge bg="primary" pill>{index + 1}</Badge>}
                                    </ListGroup.Item>
                                );
                            })}
                        </ListGroup>
                        <div className="text-center">
                            <Button variant="primary" size="lg" onClick={() => handleSubmit(false)} disabled={route.length === 0}>
                                <i className="bi bi-send me-2" />Submit route
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }

    if (phase === 'execution') {
        const { result } = game;
        const allRevealed = revealedSteps.length === result.steps.length;
        const handleRevealNext = () => setRevealedSteps(prev => [...prev, result.steps[prev.length]]);

        return (
            <Container className="py-4">
                <h2 className="mb-1">Executing route</h2>
                <p className="text-muted mb-4">
                    {result.valid ? 'Your route was valid — revealing events step by step.' : 'Your route was invalid — no coins awarded.'}
                </p>

                <ListGroup className="mb-4">
                    {revealedSteps.map((step, i) => {
                        const positive = step.event.effect >= 0;
                        return (
                            <ListGroup.Item key={i} className="d-flex justify-content-between align-items-center">
                                <span>
                                    <strong>{step.station1}</strong> <i className="bi bi-arrow-left-right mx-2" /> <strong>{step.station2}</strong>
                                    <span className="ms-3"><strong>{step.event.title}</strong> <span className="text-muted">— {step.event.description}</span></span>
                                </span>
                                <span className="d-flex align-items-center gap-3">
                                    <Badge bg={positive ? 'success' : 'danger'}>
                                        {positive ? '+' : ''}{step.event.effect} coins
                                    </Badge>
                                    <span className="fw-bold">{step.coinsAfter} total</span>
                                </span>
                            </ListGroup.Item>
                        );
                    })}
                </ListGroup>

                <div className="text-center">
                    {!allRevealed
                        ? <Button variant="primary" onClick={handleRevealNext}>
                            <i className="bi bi-chevron-right me-2" />Next step
                          </Button>
                        : <Button variant="success" onClick={() => setPhase('result')}>
                            <i className="bi bi-flag-fill me-2" />See result
                          </Button>
                    }
                </div>
            </Container>
        );
    }

    if (phase === 'result') {
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
                        <Button variant="primary" onClick={() => { setGame(null); setRoute([]); setRevealedSteps([]); setPhase('setup'); }}>
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

}

export default GamePage;
