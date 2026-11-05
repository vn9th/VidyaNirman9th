VIDYA NIRMAN — PLATFORM UPGRADE (PHASE 1 + EXAM PREVIEW)

VISION SELECTED
All-in-one digital education platform with premium design, AI-powered learning, tests, courses and a responsive mobile experience.

WHAT THIS PACKAGE UPDATES
- index.html: retains the existing homepage and adds the dashboard/exam entry points and the existing premium hero motion from the prior working upgrade.
- dashboard.html: student dashboard with learning activity, streak, notes, recent pages, achievements and optional cloud-sync controls.
- global-learning.js: local-first learning tracker; optional Supabase sync for page visits, quiz activity/results and saved notes. AI chat text is deliberately excluded from cloud sync.
- OPTIONAL-cloud-sync-schema.sql: creates a separate student_learning_records table with Row Level Security.
- exam-centre.html: links existing subject quest pages and the new timed mock test.
- mock-exam.html: 15-question Class 9 Science practice test, 20-minute timer, question navigation, scoring and explanations.
- coding.html: latest mobile-responsive Coding Academy file supplied in the recent work.
- sw.js: cache version updated to include the mock exam.

PRESERVED
Existing subject portals, PDF notes, videos, images, logo, founder assets, Supabase auth files, existing AI endpoint integration, AdSense placements, manifest, CNAME and service-worker setup.

IMPORTANT CLOUD SYNC SETUP
1. Back up your GitHub repository before replacing files.
2. In Supabase SQL Editor, run OPTIONAL-cloud-sync-schema.sql once. It creates public.student_learning_records and enables RLS.
3. Confirm auth-config.js contains only your Supabase Project URL and publishable/anon browser key. Never place service_role or sb_secret keys in frontend files.
4. Deploy the ZIP contents to your existing GitHub Pages repository.
5. Sign in at the site, open dashboard.html and choose Enable cloud sync. Sync is opt-in.
6. Test with two test accounts; verify each account sees only its own records.

DATA AND PRIVACY
- Visits, quiz activity/results and notes can sync only after a signed-in student explicitly enables sync.
- AI prompts and replies remain local and are not uploaded by this feature.
- Disabling sync stops future sync; it does not delete cloud records. Delete a student's cloud records only through an authenticated, reviewed account-data deletion process.
- Do not collect unnecessary personal details. Ask a parent/guardian or trusted adult to review the privacy setup before public launch to students.

TEST STATUS
Static checks are included in the accompanying report. This package has not been deployed. OAuth, email confirmation, live Supabase RLS behavior, AI service responses and physical-device rendering still require end-to-end tests on your live site.
