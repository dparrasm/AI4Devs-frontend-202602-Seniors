export type PositionDto = {
  id: number;
  title: string;
  status: string;
  isVisible: boolean;
  location: string;
  applicationDeadline: string | null;
  company: {
    id: number;
    name: string;
  };
  candidateCount: number;
};

export type InterviewStepDto = {
  id: number;
  interviewFlowId: number;
  interviewTypeId: number;
  name: string;
  orderIndex: number;
};

export type InterviewFlowDto = {
  interviewFlow: {
    positionName: string;
    interviewFlow: {
      id: number;
      description?: string | null;
      interviewSteps: InterviewStepDto[];
    };
  };
};

export type CandidateByPositionDto = {
  id: number;
  applicationId: number;
  fullName: string;
  currentInterviewStep: string;
  currentInterviewStepId: number;
  averageScore: number;
};

export type UpdateCandidateStagePayload = {
  applicationId: number;
  currentInterviewStep: number;
};

export type PipelinePosition = {
  id: number;
  title: string;
  status: string;
  isVisible: boolean;
  location: string;
  applicationDeadline: string | null;
  companyName: string;
  candidateCount: number;
};

export type PipelineColumn = {
  id: number;
  title: string;
  order: number;
};

export type PipelineCandidate = {
  id: number;
  applicationId: number;
  fullName: string;
  currentStepId: number;
  currentStepName: string;
  averageScore: number;
};

export type CandidatePipelineData = {
  positionId: number;
  positionName: string;
  columns: PipelineColumn[];
  candidates: PipelineCandidate[];
};
