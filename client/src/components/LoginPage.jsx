import { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';

function LoginPage({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            setError('Please fill in all fields.');
            return;
        }
        setError('');
        try {
            await onLogin({ username, password });
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-start py-5">
            <div className="border rounded-3 shadow-sm p-4 p-md-5">
                <h2 className="mb-4">Login</h2>
                {error && <Alert variant="danger" className="py-2">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="username">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            autoFocus
                        />
                    </Form.Group>
                    <Form.Group className="mb-4" controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </Form.Group>
                    <Button type="submit" variant="primary" className="w-100">
                        <i className="bi bi-box-arrow-in-right me-2" />Login
                    </Button>
                </Form>
            </div>
        </Container>
    );
}

export default LoginPage;
