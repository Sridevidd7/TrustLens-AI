# TODO - TrustLens capability upgrades

- [ ] Update `src/mock-data.ts` data model (reviewers, dissent, inactionCost, provenanceGraph) and seed mock recommendations + audit events.


- [ ] Extend `src/screens/Profile.tsx` trust calibration UI:
  - [ ] Add reviewer calibration section
  - [ ] Add Mutuality index summary
- [ ] Extend `src/screens/ApprovalCenter.tsx`:
  - [ ] Add Reviewer column/label and calibration badge
  - [ ] Add sort/highlight by inaction cost
- [ ] Extend `src/screens/AuditTrail.tsx`:
  - [ ] Add support for new audit event types (agent raised objection / resolved / escalated)
  - [ ] Add calibration badge next to human reviewer/actor names
- [ ] Extend `src/screens/Dashboard.tsx`:
  - [ ] Add SLA urgency indicator on each dashboard row
- [ ] Extend `src/screens/Explanation.tsx`:
  - [ ] Add Dissent block (shown only when present)
  - [ ] Add Cost of waiting card
  - [ ] Replace/augment reasoning trace with List/Graph view provenance graph
  - [ ] Ensure node click interactions show details
- [ ] Implement provenance graph component if needed (`src/components/ProvenanceGraph.tsx`).
- [ ] Run build/lint and smoke-test navigation + modals.

