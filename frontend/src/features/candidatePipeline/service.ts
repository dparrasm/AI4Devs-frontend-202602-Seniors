import {
  CandidateByPositionDto,
  CandidatePipelineData,
  InterviewFlowDto,
  PipelinePosition,
  PositionDto,
  UpdateCandidateStagePayload,
} from './types';
import {
  getPositionNameFromInterviewFlowDto,
  mapCandidateDtoToPipelineCandidate,
  mapInterviewFlowDtoToColumns,
  mapPositionDtoToPipelinePosition,
} from './mappers';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:3010';

const fetchJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
};

const sendJson = async <TPayload>(path: string, method: string, payload: TPayload): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  await response.json();
};

export const fetchPositions = async (): Promise<PipelinePosition[]> => {
  const positions = await fetchJson<PositionDto[]>('/position');
  return positions.map(mapPositionDtoToPipelinePosition);
};

export const fetchInterviewFlow = async (positionId: number): Promise<InterviewFlowDto> =>
  fetchJson<InterviewFlowDto>(`/position/${positionId}/interviewflow`);

export const fetchCandidatesByPosition = async (positionId: number): Promise<CandidateByPositionDto[]> =>
  fetchJson<CandidateByPositionDto[]>(`/position/${positionId}/candidates`);

export const fetchCandidatePipelineData = async (positionId: number): Promise<CandidatePipelineData> => {
  const [interviewFlow, candidates] = await Promise.all([
    fetchInterviewFlow(positionId),
    fetchCandidatesByPosition(positionId),
  ]);

  return {
    positionId,
    positionName: getPositionNameFromInterviewFlowDto(interviewFlow),
    columns: mapInterviewFlowDtoToColumns(interviewFlow),
    candidates: candidates.map(mapCandidateDtoToPipelineCandidate),
  };
};

export const updateCandidateStage = async (
  candidateId: number,
  payload: UpdateCandidateStagePayload,
): Promise<void> => {
  await sendJson(`/candidates/${candidateId}`, 'PUT', payload);
};
