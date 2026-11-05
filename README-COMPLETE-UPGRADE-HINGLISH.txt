VIDYA NIRMAN — COMPLETE STUDENT EXPERIENCE + HOMEPAGE UPGRADE

This package is an additive update based on the supplied VidyaNirman9th-main project. It keeps the existing site architecture and original learning pages. Review the Git diff before publishing.

WHAT IS INCLUDED
1. Student Dashboard (dashboard.html)
   - Existing learning activity summary, weekly visits, streak, saved notes, quiz interactions, AI history and recent pages.
   - Added learning toolkit shortcuts, Exam Preparation Centre link, activity-milestone badges, browser-saved daily checklist and saved-note search.
   - Milestones are based only on locally recorded activity. They do not claim verified course completion or official marks.
2. Homepage transformation (index.html)
   - Premium animated hero treatment matching the existing maroon/black/gold theme.
   - New direct calls to action for Dashboard, Study Hub and Exam Preparation Centre.
   - Added feature summary and Exam Prep navigation. Existing portal sections, founders, AI panel, AdSense placements, logo and existing links remain in the file.
3. Exam Preparation Centre (exam-centre.html)
   - New directory to the existing Biology, Physics, Chemistry and Grand Quest quiz pages. It does not replace those quizzes.
4. Learning tracker (global-learning.js)
   - Improved compatibility for the homepage AI request format that sends a messages[] array. This only records a chat when a compatible answer field is returned.
5. Service worker (sw.js)
   - Cache version bumped and the new Exam Preparation Centre added to the small offline shell.

EXISTING FEATURES PRESERVED
- Existing subject portals, quiz/quest pages, Coding Academy, Study Hub, notes/PDF files, images/videos, auth pages and scripts, AI integration, manifest, CNAME, logo and AdSense code/placements.
- This package does not delete or replace the current lesson content.

IMPORTANT LIMITATIONS
- Dashboard data (visits, quiz interactions, AI history, saved notes, checklist) remains in localStorage on the current browser/device. It is not synced across devices or isolated per Supabase user by this update.
- A visit is not verified chapter completion. A quiz button interaction is not a score. Activity badges are not certificates.
- AI history capture depends on the actual API response containing a supported answer/reply field.
- No real browser/device QA or production deployment was performed.
- PWA/offline behaviour depends on HTTPS, browser support and successful service-worker installation. AI, external fonts and large PDFs/videos are not guaranteed offline.

SAFE INSTALL
1. Download a backup of the current GitHub repository first.
2. Extract this ZIP and open the VidyaNirman9th-main folder.
3. Upload the CONTENTS of that folder to the GitHub repository root (not the parent folder). Do not delete unrelated existing files.
4. Review the changed files/diff before committing.
5. After deployment, test index.html, auth.html, dashboard.html, study-hub.html, exam-centre.html, all four quiz pages, AI chat and Coding Academy on desktop and mobile.
6. Test email signup/confirmation, Google sign-in and password reset before inviting students.
7. If anything breaks, revert the GitHub commit or restore your backup.

SECURITY
- Never place Supabase service_role or sb_secret keys in frontend files. Browser publishable/anon keys are intended for public clients, but private student data still requires proper database policies.
- This package does not enable cloud sync or create new database tables. The optional SQL file remains groundwork only; do not run it expecting the dashboard to sync automatically.
- Avoid collecting unnecessary student personal information.
