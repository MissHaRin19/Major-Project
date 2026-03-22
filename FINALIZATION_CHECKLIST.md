# Finalization Improvements Needed for SecureBioSim

This is the practical improvement list required to move SecureBioSim from a prototype/demo to a finalized project submission.

## P0 (must-fix before final demo sign-off)

1. **Fix health-check integration mismatch**
   - Frontend calls `/api/healthproxy` while Express exposes `/api/healthProxy`.
   - Standardize route casing and verify ML sync indicator reflects real backend status.

2. **Stop trusting client-provided attack labels for detection**
   - Current backend logic branches by incoming `attack_type`.
   - Final version should infer attack/anomaly from telemetry features/model outputs first, then classify.

3. **Add an actual automated test suite**
   - Backend: endpoint contract tests (`/health`, `/infer`) + detection behavior tests.
   - Frontend: attack launch/mitigation workflow tests + health status tests.

4. **Add CI workflow**
   - Run type-check, tests, and build on every push/PR.
   - Block merges when checks fail.

---

## P1 (strongly recommended for finalization quality)

5. **Backend-driven mitigation policy**
   - Move key mitigation decisions from UI-only timers to backend policy responses.
   - Emit auditable events (detected, classified, mitigated, recovered).

6. **Configuration hardening**
   - Replace hardcoded local URLs with environment-driven config.
   - Tighten CORS per environment instead of permissive wildcard policy.

7. **Dataset and training reproducibility**
   - Add reproducible scripts/docs for MIT-BIH preprocessing, training, threshold tuning, and model export.
   - Document synthetic-data assumptions and where real data is used.

8. **Objective evaluation report**
   - Provide precision/recall/F1, confusion matrix, and latency across attack scenarios.
   - Include experiment settings and reproducible commands.

---

## P2 (packaging and submission polish)

9. **Documentation restructuring**
   - Split root/frontend/backend docs clearly.
   - Add clean run instructions with explicit directories and commands.

10. **Deployment artifacts**
   - Add `Dockerfile`(s), optional `docker-compose.yml`, and `.env.example`.
   - Include production runbook and health verification steps.

11. **Security and reliability checks**
   - Add rate limiting/basic auth strategy for sensitive endpoints.
   - Add error handling and fallback behavior when model/backend is unavailable.

---

## Finalization “Done” criteria
- Integration works end-to-end without manual patching.
- Detection and mitigation are demonstrably AI-assisted and backend-enforced.
- Tests + CI are green.
- Dataset/model pipeline is reproducible.
- Deployment and documentation are complete for an external evaluator.
