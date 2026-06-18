import { Container, Button, Badge, ListGroup } from 'react-bootstrap';

function ExecutionPhase({ game, revealedSteps, onRevealNext, onFinish }) {
    const { result } = game;
    const allRevealed = revealedSteps.length === result.steps.length;

    return (
        <Container className="py-4">
            <h2 className="mb-1">Executing route</h2>
            <p className="text-muted mb-4">
                {result.valid ? 'Your route was valid — revealing events step by step.' : 'Your route was invalid — no coins awarded.'}
            </p>

            <div className="text-center mb-4">
                {!allRevealed
                    ? <Button variant="primary" onClick={onRevealNext}>
                        <i className="bi bi-chevron-right me-2" />Next step
                      </Button>
                    : <Button variant="success" onClick={onFinish}>
                        <i className="bi bi-flag-fill me-2" />See result
                      </Button>
                }
            </div>

            <ListGroup>
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
        </Container>
    );
}

export default ExecutionPhase;
