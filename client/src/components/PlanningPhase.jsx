import { Container, Button, Badge, Row, Col, ListGroup } from 'react-bootstrap';
import NetworkMap from './NetworkMap.jsx';

function PlanningPhase({ network, segments, game, route, timeLeft, onToggleSegment, onSubmit }) {
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
                    <NetworkMap
                        network={network}
                        startStation={game.startStation.name}
                        destinationStation={game.destinationStation.name}
                        showLines={false}
                    />
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
                                    onClick={() => onToggleSegment(seg)}
                                    className="d-flex justify-content-between align-items-center"
                                >
                                    <span>{seg.station1} <i className="bi bi-arrow-left-right mx-2" /> {seg.station2}</span>
                                    {selected && <Badge bg="primary" pill>{index + 1}</Badge>}
                                </ListGroup.Item>
                            );
                        })}
                    </ListGroup>
                    <div className="text-center">
                        <Button variant="primary" size="lg" onClick={onSubmit} disabled={route.length === 0}>
                            <i className="bi bi-send me-2" />Submit route
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default PlanningPhase;
