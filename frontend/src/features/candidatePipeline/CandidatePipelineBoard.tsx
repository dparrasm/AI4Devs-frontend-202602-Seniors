import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Container, Spinner } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { fetchCandidatePipelineData, updateCandidateStage } from './service';
import { CandidatePipelineData, PipelineCandidate, PipelineColumn } from './types';

type LoadStatus = 'loading' | 'success' | 'error';

const groupCandidatesByColumn = (
  columns: PipelineColumn[],
  candidates: PipelineCandidate[],
): Record<number, PipelineCandidate[]> => {
  const groupedCandidates = columns.reduce<Record<number, PipelineCandidate[]>>((groups, column) => {
    groups[column.id] = [];
    return groups;
  }, {});

  candidates.forEach(candidate => {
    if (groupedCandidates[candidate.currentStepId]) {
      groupedCandidates[candidate.currentStepId].push(candidate);
    }
  });

  return groupedCandidates;
};

const getAdjacentColumn = (
  columns: PipelineColumn[],
  currentStepId: number,
  direction: 'previous' | 'next',
): PipelineColumn | null => {
  const currentIndex = columns.findIndex(column => column.id === currentStepId);

  if (currentIndex === -1) {
    return null;
  }

  const targetIndex = direction === 'previous' ? currentIndex - 1 : currentIndex + 1;
  return columns[targetIndex] ?? null;
};

const CandidateCard = ({
  candidate,
  columns,
  isMovementPending,
  isThisCandidateMoving,
  onMove,
}: {
  candidate: PipelineCandidate;
  columns: PipelineColumn[];
  isMovementPending: boolean;
  isThisCandidateMoving: boolean;
  onMove: (candidate: PipelineCandidate, targetColumn: PipelineColumn) => void;
}) => {
  const previousColumn = getAdjacentColumn(columns, candidate.currentStepId, 'previous');
  const nextColumn = getAdjacentColumn(columns, candidate.currentStepId, 'next');

  return (
  <Card as="article" className="shadow-sm mb-3">
    <Card.Body>
      <Card.Title as="h3" className="h6 mb-2">
        {candidate.fullName}
      </Card.Title>
      <Card.Text className="mb-2 text-muted">
        Etapa actual: {candidate.currentStepName}
      </Card.Text>
      <div className="d-flex justify-content-between align-items-center">
        <Badge bg="secondary">Score medio: {candidate.averageScore.toFixed(1)}</Badge>
        <span className="text-muted small">Solicitud #{candidate.applicationId}</span>
      </div>
      <div className="d-flex gap-2 mt-3">
        <Button
          variant="outline-secondary"
          size="sm"
          disabled={!previousColumn || isMovementPending}
          onClick={() => previousColumn && onMove(candidate, previousColumn)}
          aria-label={
            previousColumn
              ? `Mover ${candidate.fullName} a ${previousColumn.title}`
              : `${candidate.fullName} ya está en la primera etapa`
          }
        >
          Anterior
        </Button>
        <Button
          variant="outline-primary"
          size="sm"
          disabled={!nextColumn || isMovementPending}
          onClick={() => nextColumn && onMove(candidate, nextColumn)}
          aria-label={
            nextColumn
              ? `Mover ${candidate.fullName} a ${nextColumn.title}`
              : `${candidate.fullName} ya está en la última etapa`
          }
        >
          {isThisCandidateMoving ? 'Moviendo...' : 'Siguiente'}
        </Button>
      </div>
    </Card.Body>
  </Card>
  );
};

const PipelineColumnSection = ({
  column,
  candidates,
  columns,
  movingCandidateId,
  onMoveCandidate,
}: {
  column: PipelineColumn;
  candidates: PipelineCandidate[];
  columns: PipelineColumn[];
  movingCandidateId: number | null;
  onMoveCandidate: (candidate: PipelineCandidate, targetColumn: PipelineColumn) => void;
}) => (
  <section
    className="bg-light border rounded p-3 h-100"
    aria-labelledby={`pipeline-column-${column.id}`}
    style={{ minWidth: '18rem' }}
  >
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h2 id={`pipeline-column-${column.id}`} className="h5 mb-0">
        {column.title}
      </h2>
      <Badge bg="primary" pill>
        {candidates.length}
      </Badge>
    </div>

    {candidates.length === 0 ? (
      <p className="text-muted mb-0">Sin candidatos en esta etapa.</p>
    ) : (
      <ul className="list-unstyled mb-0">
        {candidates.map(candidate => (
          <li key={candidate.id}>
            <CandidateCard
              candidate={candidate}
              columns={columns}
              isMovementPending={movingCandidateId !== null}
              isThisCandidateMoving={movingCandidateId === candidate.id}
              onMove={onMoveCandidate}
            />
          </li>
        ))}
      </ul>
    )}
  </section>
);

const CandidatePipelineBoard = () => {
  const { positionId } = useParams();
  const parsedPositionId = Number(positionId);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [pipelineData, setPipelineData] = useState<CandidatePipelineData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [movementErrorMessage, setMovementErrorMessage] = useState('');
  const [movingCandidateId, setMovingCandidateId] = useState<number | null>(null);

  const loadPipelineData = useCallback(async () => {
    if (!Number.isInteger(parsedPositionId)) {
      setStatus('error');
      setErrorMessage('La posición solicitada no es válida.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const data = await fetchCandidatePipelineData(parsedPositionId);
      setPipelineData(data);
      setMovementErrorMessage('');
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo cargar el pipeline.');
    }
  }, [parsedPositionId]);

  useEffect(() => {
    loadPipelineData();
  }, [loadPipelineData]);

  const candidatesByColumn = useMemo(() => {
    if (!pipelineData) {
      return {};
    }

    return groupCandidatesByColumn(pipelineData.columns, pipelineData.candidates);
  }, [pipelineData]);

  const moveCandidate = async (candidate: PipelineCandidate, targetColumn: PipelineColumn) => {
    if (!pipelineData || movingCandidateId !== null || candidate.currentStepId === targetColumn.id) {
      return;
    }

    const previousPipelineData = pipelineData;

    const updatedCandidates = pipelineData.candidates.map(existingCandidate =>
      existingCandidate.id === candidate.id
        ? {
            ...existingCandidate,
            currentStepId: targetColumn.id,
            currentStepName: targetColumn.title,
          }
        : existingCandidate,
    );

    setPipelineData({
      ...pipelineData,
      candidates: updatedCandidates,
    });
    setMovementErrorMessage('');
    setMovingCandidateId(candidate.id);

    try {
      await updateCandidateStage(candidate.id, {
        applicationId: candidate.applicationId,
        currentInterviewStep: targetColumn.id,
      });
    } catch (error) {
      setPipelineData(previousPipelineData);
      setMovementErrorMessage(
        error instanceof Error
          ? `No se pudo mover a ${candidate.fullName}: ${error.message}`
          : `No se pudo mover a ${candidate.fullName}.`,
      );
    } finally {
      setMovingCandidateId(null);
    }
  };

  if (status === 'loading') {
    return (
      <Container className="mt-5" aria-live="polite">
        <div className="d-flex align-items-center gap-2">
          <Spinner animation="border" role="status" size="sm" />
          <span>Cargando pipeline de candidatos...</span>
        </div>
      </Container>
    );
  }

  if (status === 'error') {
    return (
      <Container className="mt-5">
        <Alert variant="danger" role="alert">
          <Alert.Heading>No se pudo cargar el pipeline</Alert.Heading>
          <p>{errorMessage}</p>
          <div className="d-flex gap-2">
            <Button variant="danger" onClick={loadPipelineData}>
              Reintentar
            </Button>
            <Link to="/positions" className="btn btn-outline-secondary">
              Volver a posiciones
            </Link>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!pipelineData) {
    return null;
  }

  return (
    <Container fluid className="mt-5 px-4">
      <header className="mb-4">
        <Link to="/positions" className="btn btn-link px-0 mb-2">
          Volver a posiciones
        </Link>
        <h1 className="mb-1">Pipeline de candidatos</h1>
        <p className="text-muted mb-0">{pipelineData.positionName}</p>
      </header>

      {pipelineData.columns.length === 0 ? (
        <Alert variant="warning">No hay flujo de entrevistas configurado para esta posición.</Alert>
      ) : (
        <main aria-label={`Pipeline de candidatos para ${pipelineData.positionName}`}>
          {movementErrorMessage && (
            <Alert variant="danger" role="alert" aria-live="assertive">
              {movementErrorMessage}
            </Alert>
          )}

          {pipelineData.candidates.length === 0 && (
            <Alert variant="info">No hay candidatos para esta posición.</Alert>
          )}

          <div className="d-flex gap-3 overflow-auto pb-3" role="list" aria-label="Etapas del pipeline">
            {pipelineData.columns.map(column => (
              <div key={column.id} className="flex-shrink-0" role="listitem" style={{ width: '20rem' }}>
                <PipelineColumnSection
                  column={column}
                  candidates={candidatesByColumn[column.id] ?? []}
                  columns={pipelineData.columns}
                  movingCandidateId={movingCandidateId}
                  onMoveCandidate={moveCandidate}
                />
              </div>
            ))}
          </div>
        </main>
      )}
    </Container>
  );
};

export default CandidatePipelineBoard;
