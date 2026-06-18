import { useState, useEffect, useRef } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { getNetwork, startGame, submitRoute } from '../api/api.js';
import SetupPhase from './SetupPhase.jsx';
import PlanningPhase from './PlanningPhase.jsx';
import ExecutionPhase from './ExecutionPhase.jsx';
import ResultPhase from './ResultPhase.jsx';

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
                if (t <= 1) {
                    clearInterval(timerRef.current);
                    handleSubmit();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [phase]);

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

    const handleSubmit = async () => {
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

    const handleRevealNext = () => setRevealedSteps(prev => [...prev, game.result.steps[prev.length]]);

    const handlePlayAgain = () => {
        setGame(null);
        setRoute([]);
        setRevealedSteps([]);
        setPhase('setup');
    };

    if (loading) return <Container className="py-5"><Spinner animation="border" /></Container>;
    if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

    if (phase === 'setup')
        return <SetupPhase network={network} onStart={handleStart} />;

    if (phase === 'planning')
        return (
            <PlanningPhase
                network={network}
                segments={segments}
                game={game}
                route={route}
                timeLeft={timeLeft}
                onToggleSegment={handleToggleSegment}
                onSubmit={handleSubmit}
            />
        );

    if (phase === 'execution')
        return (
            <ExecutionPhase
                game={game}
                revealedSteps={revealedSteps}
                onRevealNext={handleRevealNext}
                onFinish={() => setPhase('result')}
            />
        );

    if (phase === 'result')
        return <ResultPhase game={game} onPlayAgain={handlePlayAgain} />;
}

export default GamePage;
