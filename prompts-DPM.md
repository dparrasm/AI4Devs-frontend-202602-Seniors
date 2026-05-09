# Prompts DPM

## 2026-05-09 - Architecture Analysis Before Implementation

Analyze the repository and explain the current architecture before implementing anything.

I want you to identify:

* framework and tooling
* routing structure
* state management approach
* API integration patterns
* styling system
* component organization
* existing abstractions
* testing setup
* architectural strengths
* architectural inconsistencies
* places where over-engineering should be avoided

Then explain:

* how you would approach the exercise,
* what the minimum production-quality solution should look like,
* and what should NOT be overcomplicated.

Do not implement yet.

## 2026-05-09 - Candidate Pipeline Data Loading Layer

Implement only the data loading layer for the candidate pipeline feature.

Goals:

* fetch positions
* fetch interview flow
* fetch candidates
* define typed DTOs
* create mapping boundaries if needed
* expose clean UI-friendly models

Do not implement drag-and-drop yet.
Do not create unnecessary abstractions.
Keep the implementation incremental and easy to refactor.

## 2026-05-09 - Candidate Pipeline Board UI

Implement the board UI using the existing project conventions.

Goals:

* render columns from interview flow
* render candidate cards inside each column
* support loading states
* support empty states
* support error states
* responsive layout
* semantic accessible structure

Do not implement candidate movement yet.
Focus on clarity and maintainability.

## 2026-05-09 - Candidate Movement Between Stages

Implement candidate movement between stages.

Requirements:

* use the simplest reliable approach
* persist movement through the correct API mutation
* keep UI state consistent
* support optimistic updates only if implementation remains simple
* handle mutation failures gracefully

Accessibility:

* drag-and-drop should not be the only interaction if avoidable
* preserve keyboard usability

Avoid over-engineering.

## 2026-05-09 - Candidate Pipeline Critical Review

Review the implementation critically as a senior frontend engineer.

Analyze:

* architecture quality
* unnecessary complexity
* accessibility gaps
* performance risks
* state management problems
* rendering inefficiencies
* testing gaps
* API integration issues
* maintainability concerns

Then propose targeted improvements ordered by impact.

Do not rewrite the entire feature.
Prefer incremental improvements.

Focus on maintainability, clarity and pragmatic frontend engineering.

## 2026-05-09 - Candidate Pipeline Board Implementation Plan

Now create a step-by-step implementation plan for the candidate pipeline board.

The plan should include:

1. data loading strategy
2. API integration approach
3. DTO to UI mapping strategy
4. board rendering structure
5. column/card architecture
6. candidate movement flow
7. mutation handling
8. optimistic update strategy
9. loading/error/empty states
10. responsive behavior
11. accessibility considerations
12. testing strategy

Important:

* prioritize simplicity
* avoid unnecessary abstractions
* avoid introducing global state unless truly necessary
* avoid premature architecture
* optimize for readability and maintainability

Do not implement yet.

## 2026-05-09 - Architecture Analysis Before Implementation

Analyze the repository and explain the current architecture before implementing anything.

I want you to identify:

* framework and tooling
* routing structure
* state management approach
* API integration patterns
* styling system
* component organization
* existing abstractions
* testing setup
* architectural strengths
* architectural inconsistencies
* places where over-engineering should be avoided

Then explain:

* how you would approach the exercise,
* what the minimum production-quality solution should look like,
* and what should NOT be overcomplicated.

Do not implement yet.

Focus on maintainability, clarity and pragmatic frontend engineering.
