import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router';

function NotFoundPage() {
    return (
        <Container className="py-5 text-center">
            <h1>404</h1>
            <p className="text-muted mb-4">Page not found.</p>
            <Button as={Link} to="/" variant="primary">Go home</Button>
        </Container>
    );
}

export default NotFoundPage;
