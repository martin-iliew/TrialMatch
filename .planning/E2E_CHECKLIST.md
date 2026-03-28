# TrialMatch E2E Checklist

Run against the live Vercel URL. Mark each step pass/fail. A single fail = fix before demo.

---

## Sponsor Flow (DB Dev)

| # | Action | Expected Outcome | Pass/Fail |
|---|--------|-----------------|-----------|
| 1 | Open live URL, click Register, fill form with role = Sponsor, submit | Redirected to `/sponsor/projects` | |
| 2 | Click "New Trial Project", fill title / description / therapeutic area / phase / patient count / dates / geographic preference, submit | Project card appears in list with `draft` status badge | |
| 3 | Open the project detail page, click "Add Requirement", add a requirement with type = Equipment, value = MRI, priority = Required, submit | Requirement row appears in requirements list | |
| 4 | Add a second requirement: type = Certification, value = GCP, priority = Required | Second requirement row appears | |
| 5 | Click "Find Matching Clinics" | Page redirects to `/sponsor/projects/[id]/matches` with a ranked list of clinic cards showing overall score | |
| 6 | Click on a clinic card to open the profile modal | Modal shows clinic name, city, specializations, equipment list, certifications, availability dates | |
| 7 | Close modal, click "Send Inquiry" on the top-ranked clinic, fill in message, submit | Inquiry status badge replaces the "Send Inquiry" button on that clinic card | |

---

## Clinic Flow (Logic Dev)

| # | Action | Expected Outcome | Pass/Fail |
|---|--------|-----------------|-----------|
| 1 | Log in as seed clinic admin (use credentials from seed.sql) | Redirected to `/clinic/profile` | |
| 2 | Check Profile tab | Clinic name, city, address, specializations are pre-populated from seed | |
| 3 | Check Equipment tab | At least 1 equipment row is visible | |
| 4 | Check Certs & Availability tab | At least 1 certification row and availability dates are visible | |
| 5 | Navigate to `/clinic/inquiries` | Inquiry sent from the Sponsor Flow (step 7) is visible with clinic name and trial title | |
| 6 | Open the inquiry | Trial project details and sponsor message are visible | |
| 7 | Click "Accept", add a message, submit | Inquiry status updates to `accepted` | |
| 8 | Log in as the sponsor account, open the project detail page | `Accepted` badge is visible next to the clinic name, and the clinic's message is shown | |
