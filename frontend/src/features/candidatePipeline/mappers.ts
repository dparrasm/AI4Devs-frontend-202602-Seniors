import {
  CandidateByPositionDto,
  InterviewFlowDto,
  PipelineCandidate,
  PipelineColumn,
  PipelinePosition,
  PositionDto,
} from './types';

export const mapPositionDtoToPipelinePosition = (position: PositionDto): PipelinePosition => ({
  id: position.id,
  title: position.title,
  status: position.status,
  isVisible: position.isVisible,
  location: position.location,
  applicationDeadline: position.applicationDeadline,
  companyName: position.company.name,
  candidateCount: position.candidateCount,
});

export const mapInterviewFlowDtoToColumns = (flow: InterviewFlowDto): PipelineColumn[] =>
  [...flow.interviewFlow.interviewFlow.interviewSteps]
    .sort((firstStep, secondStep) => firstStep.orderIndex - secondStep.orderIndex)
    .map(step => ({
      id: step.id,
      title: step.name,
      order: step.orderIndex,
    }));

export const mapCandidateDtoToPipelineCandidate = (candidate: CandidateByPositionDto): PipelineCandidate => ({
  id: candidate.id,
  applicationId: candidate.applicationId,
  fullName: candidate.fullName,
  currentStepId: candidate.currentInterviewStepId,
  currentStepName: candidate.currentInterviewStep,
  averageScore: candidate.averageScore,
});

export const getPositionNameFromInterviewFlowDto = (flow: InterviewFlowDto): string =>
  flow.interviewFlow.positionName;
