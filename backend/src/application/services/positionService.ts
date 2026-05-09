import { PrismaClient } from '@prisma/client';
import { Position } from '../../domain/models/Position';

const prisma = new PrismaClient();

const calculateAverageScore = (interviews: any[]) => {
    if (interviews.length === 0) return 0;
    const totalScore = interviews.reduce((acc, interview) => acc + (interview.score || 0), 0);
    return totalScore / interviews.length;
};

export const getCandidatesByPositionService = async (positionId: number) => {
    try {
        const applications = await prisma.application.findMany({
            where: { positionId },
            include: {
                candidate: true,
                interviews: true,
                interviewStep: true
            }
        });

        return applications.map(app => ({
            fullName: `${app.candidate.firstName} ${app.candidate.lastName}`,
            currentInterviewStep: app.interviewStep.name,
            currentInterviewStepId: app.interviewStep.id,
            averageScore: calculateAverageScore(app.interviews),
            id: app.candidate.id,
            applicationId: app.id
        }));
    } catch (error) {
        console.error('Error retrieving candidates by position:', error);
        throw new Error('Error retrieving candidates by position');
    }
};

export const getPositionsService = async () => {
    try {
        const positions = await prisma.position.findMany({
            orderBy: {
                applicationDeadline: 'asc'
            },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                _count: {
                    select: {
                        applications: true
                    }
                }
            }
        });

        return positions.map(position => ({
            id: position.id,
            title: position.title,
            status: position.status,
            isVisible: position.isVisible,
            location: position.location,
            applicationDeadline: position.applicationDeadline,
            company: position.company,
            candidateCount: position._count.applications
        }));
    } catch (error) {
        console.error('Error retrieving positions:', error);
        throw new Error('Error retrieving positions');
    }
};

export const getInterviewFlowByPositionService = async (positionId: number) => {
    const positionWithInterviewFlow = await prisma.position.findUnique({
        where: { id: positionId },
        include: {
            interviewFlow: {
                include: {
                    interviewSteps: true
                }
            }
        }
    });

    if (!positionWithInterviewFlow) {
        throw new Error('Position not found');
    }

    // Formatear la respuesta para incluir el nombre de la posición y el flujo de entrevistas
    return {
        positionName: positionWithInterviewFlow.title,
        interviewFlow: {
            id: positionWithInterviewFlow.interviewFlow.id,
            description: positionWithInterviewFlow.interviewFlow.description,
            interviewSteps: positionWithInterviewFlow.interviewFlow.interviewSteps.map(step => ({
                id: step.id,
                interviewFlowId: step.interviewFlowId,
                interviewTypeId: step.interviewTypeId,
                name: step.name,
                orderIndex: step.orderIndex
            }))
        }
    };
};
