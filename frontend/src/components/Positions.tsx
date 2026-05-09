import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Card, Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchPositions } from '../features/candidatePipeline/service';
import { PipelinePosition } from '../features/candidatePipeline/types';

type LoadStatus = 'loading' | 'success' | 'error';

const statusLabels: Record<string, string> = {
    Open: 'Abierto',
    Draft: 'Borrador',
    Closed: 'Cerrado',
    Filled: 'Contratado',
};

const getStatusBadgeClass = (status: string) => {
    if (status === 'Open') return 'bg-warning';
    if (status === 'Filled') return 'bg-success';
    if (status === 'Draft') return 'bg-secondary';
    return 'bg-warning';
};

const formatDeadline = (deadline: string | null) => {
    if (!deadline) return 'Sin fecha';

    return new Intl.DateTimeFormat('es-ES').format(new Date(deadline));
};

const Positions: React.FC = () => {
    const [positions, setPositions] = useState<PipelinePosition[]>([]);
    const [status, setStatus] = useState<LoadStatus>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const [titleFilter, setTitleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const loadPositions = useCallback(async () => {
        setStatus('loading');
        setErrorMessage('');

        try {
            const loadedPositions = await fetchPositions();
            setPositions(loadedPositions);
            setStatus('success');
        } catch (error) {
            setStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'No se pudieron cargar las posiciones.');
        }
    }, []);

    useEffect(() => {
        loadPositions();
    }, [loadPositions]);

    const filteredPositions = useMemo(() => {
        return positions.filter(position => {
            const matchesTitle = position.title.toLowerCase().includes(titleFilter.toLowerCase());
            const matchesStatus = statusFilter ? position.status === statusFilter : true;
            return matchesTitle && matchesStatus;
        });
    }, [positions, statusFilter, titleFilter]);

    return (
        <Container className="mt-5">
            <h2 className="text-center mb-4">Posiciones</h2>
            <Row className="mb-4">
                <Col md={3}>
                    <Form.Control
                        type="text"
                        placeholder="Buscar por título"
                        value={titleFilter}
                        onChange={(event) => setTitleFilter(event.target.value)}
                    />
                </Col>
                <Col md={3}>
                    <Form.Control type="date" aria-label="Buscar por fecha" disabled />
                </Col>
                <Col md={3}>
                    <Form.Control
                        as="select"
                        aria-label="Filtrar por estado"
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                    >
                        <option value="">Estado</option>
                        <option value="Open">Abierto</option>
                        <option value="Filled">Contratado</option>
                        <option value="Closed">Cerrado</option>
                        <option value="Draft">Borrador</option>
                    </Form.Control>
                </Col>
                <Col md={3}>
                    <Form.Control as="select" aria-label="Filtrar por empresa" disabled>
                        <option value="">Manager</option>
                    </Form.Control>
                </Col>
            </Row>

            {status === 'loading' && (
                <div className="d-flex align-items-center gap-2" aria-live="polite">
                    <Spinner animation="border" role="status" size="sm" />
                    <span>Cargando posiciones...</span>
                </div>
            )}

            {status === 'error' && (
                <Alert variant="danger" role="alert">
                    <Alert.Heading>No se pudieron cargar las posiciones</Alert.Heading>
                    <p>{errorMessage}</p>
                    <Button variant="danger" onClick={loadPositions}>
                        Reintentar
                    </Button>
                </Alert>
            )}

            {status === 'success' && filteredPositions.length === 0 && (
                <Alert variant="info">No hay posiciones que coincidan con los filtros.</Alert>
            )}

            {status === 'success' && filteredPositions.length > 0 && (
                <Row>
                    {filteredPositions.map((position) => (
                        <Col md={4} key={position.id} className="mb-4">
                            <Card className="shadow-sm h-100">
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>{position.title}</Card.Title>
                                    <Card.Text>
                                        <strong>Empresa:</strong> {position.companyName}<br />
                                        <strong>Deadline:</strong> {formatDeadline(position.applicationDeadline)}<br />
                                        <strong>Candidatos:</strong> {position.candidateCount}
                                    </Card.Text>
                                    <span className={`badge ${getStatusBadgeClass(position.status)} text-white align-self-start`}>
                                        {statusLabels[position.status] ?? position.status}
                                    </span>
                                    <div className="d-flex justify-content-between mt-3">
                                        <Link to={`/positions/${position.id}/pipeline`} className="btn btn-primary">
                                            Ver proceso
                                        </Link>
                                        <Button variant="secondary" disabled>Editar</Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default Positions;
