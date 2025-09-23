Title: Production jobs endpoints failing (500) while types succeeds

Summary
- Prod API `/jobs` and `/jobs/locations` return 500, breaking student career portal job listings. `/jobs/types` returns 200.

Environment
- Frontend: eduai-frontend (Expo web)
- Backend (prod): https://eduai-backend-t7ow.onrender.com/api/v1
- Date/Time: 2025-09-23 (local)

Endpoints and Status
- GET /jobs → 500
- GET /jobs/types → 200
- GET /jobs/locations → 500

Repro Steps
1) Hit prod endpoints directly:
   - `curl -s -o /dev/null -w "prod /jobs %{http_code}\n" "https://eduai-backend-t7ow.onrender.com/api/v1/jobs?limit=5"`
   - `curl -s -o /dev/null -w "prod /jobs/types %{http_code}\n" "https://eduai-backend-t7ow.onrender.com/api/v1/jobs/types"`
   - `curl -s -o /dev/null -w "prod /jobs/locations %{http_code}\n" "https://eduai-backend-t7ow.onrender.com/api/v1/jobs/locations"`

Observed Response (sample)
```json
{"success":false,"message":"Failed to retrieve jobs"}
```

Expected
- All three endpoints should return 200 with data payloads that match frontend expectations.

Impact
- Student portal displays fallback mock jobs instead of real listings when prod `/jobs` fails.

Notes
- Local dev backend at `http://localhost:3001/api/v1` returns 200 for all three endpoints and real job data (e.g., Meta, Nike).
- Frontend call site: `screens/SimpleJobPortalScreen.js` uses `apiClient.getJobs`, `getJobTypes`, `getJobLocations`.

Suggested Next Actions (Backend)
- Inspect logs for `/jobs` and `/jobs/locations` in prod; check upstream job source/config.
- Validate DB/third-party API connectivity and schema assumptions for these routes in prod.
- Ensure consistent response envelope: `{ success, data: { jobs: [...] } }`.


