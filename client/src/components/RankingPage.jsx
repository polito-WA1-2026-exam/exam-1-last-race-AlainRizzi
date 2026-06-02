import { useState, useEffect } from 'react';
import { Container, Table, Alert, Spinner } from 'react-bootstrap';
import { getRanking } from '../api/api.js';

function RankingPage() {
    const [ranking, setRanking] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getRanking()
            .then(data => setRanking(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <Container className="py-5">
            <h2 className="mb-4"><i className="bi bi-trophy me-2" />Ranking</h2>
            {loading && <Spinner animation="border" />}
            {error && <Alert variant="danger">{error}</Alert>}
            {!loading && !error && (
                <Table striped hover responsive>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Player</th>
                            <th>Score</th>
                            <th>Route</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ranking.length === 0
                            ? <tr><td colSpan={4} className="text-center text-muted">No games played yet.</td></tr>
                            : ranking.map((row, i) => (
                                <tr key={row.username}>
                                    <td>{i + 1}</td>
                                    <td>{row.username}</td>
                                    <td><strong>{row.score}</strong> coins</td>
                                    <td className="text-muted">{row.startStation} <i className="bi bi-arrow-right" /> {row.destinationStation}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </Table>
            )}
        </Container>
    );
}

export default RankingPage;
