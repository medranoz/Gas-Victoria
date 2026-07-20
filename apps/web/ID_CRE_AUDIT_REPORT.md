# Comprehensive Audit Report: ID_CRE Field in ATQs Module

**Date:** 2026-07-02
**Module:** ATQs (Autotanques)
**Field:** `id_cre`

## PHASE 1: FRONTEND FORM AUDIT
**File:** `apps/web/src/components/atqs/ATQForm.jsx`
- **Input Type:** Standard text `<Input>` component.
- **Attributes:** 
  - `placeholder="L012345"`
  - `disabled={!!atqId}`
- **Restrictions:** 
  - No HTML `maxLength`, `minLength`, or `pattern` attributes are defined on the input element itself.
  - **CRITICAL:** The field is strictly disabled during Edit Mode (`disabled={!!atqId}`). Once an ATQ is created, the `id_cre` cannot be modified through the UI without creating a new record.

## PHASE 2: FRONTEND VALIDATION AUDIT
**File:** `apps/web/src/components/atqs/ATQForm.jsx` (inside `validate()` function)
- **Validation Rule Applied:** `if (!formData.id_cre.match(/^L\d{6}$/))`
- **Regex Pattern Explained:** `/^L\d{6}$/`
  - Must start with exactly one capital letter "L".
  - Must be followed by exactly 6 digits (0-9).
  - No spaces, hyphens, or other characters allowed.
  - Exact length enforced: 7 characters.
- **Error Message:** `'Formato inválido (ej. L012345)'`
- **Impact:** This is an extremely strict validation rule that rejects valid CRE IDs if they do not match this exact legacy format.

## PHASE 3: HOOK AUDIT
**File:** `apps/web/src/hooks/useATQs.js`
- **`createATQ` Method:** Passes `id_cre` directly in the payload without any transformations, truncations, or format adjustments.
- **`updateATQ` Method:** Passes `id_cre` directly. However, since the input is disabled on the frontend, this value is never actually updated via the UI.
- **Conclusion:** The hook layer imposes no restrictions on `id_cre`.

## PHASE 4: PAGE COMPONENT AUDIT
**Files:** `CreateATQPage.jsx`, `EditATQPage.jsx`
- **Findings:** These pages serve as wrappers for `ATQForm.jsx`. They do not perform any data manipulation, pre-processing, or validation on the `id_cre` field. State and logic are contained entirely within the form component.

## PHASE 5: POCKETBASE SCHEMA AUDIT
**Collection:** `atqs`
**Field Definition:**
- **Type:** `text`
- **Required:** `True`
- **Min/Max Length:** `0` (No limits enforced by the database)
- **Pattern:** `''` (No regex pattern enforced by the database)
**Indexes:** 
- `CREATE UNIQUE INDEX idx_atqs_id_cre ON atqs (id_cre)`
- **Conclusion:** The database schema is highly permissive regarding the format and length of `id_cre`. The only strict database-level constraint is that the value must be **unique** across all ATQ records.

## PHASE 6: EXISTING DATA AUDIT (Inferred)
- **Format Patterns:** Due to the strict frontend regex (`/^L\d{6}$/`), all existing records created via the application will strictly follow the "L" + 6 digits format (e.g., L012345, L999999).
- **Truncation:** None. The regex enforces exact lengths prior to submission.
- **Inconsistencies:** If records were imported directly into PocketBase or created via API bypassing the React frontend, they may have different formats (since the DB allows any text).

## PHASE 7: ROOT CAUSE ANALYSIS & RECOMMENDATIONS
### Root Cause
The restriction on the `id_cre` field originates **entirely from the frontend form validation**. 
1. The hardcoded regex `/^L\d{6}$/` in `ATQForm.jsx` artificially limits the format of CRE IDs.
2. The `disabled={!!atqId}` attribute prevents users from fixing typos or updating the CRE ID after the initial creation.

### Impact
Users cannot input newer or alternative format CRE IDs. If an ATQ's CRE ID changes or was entered incorrectly, the user is permanently blocked from correcting it due to the disabled state of the input field.

### Recommendations for Correction
1. **Relax Validation:** Update the validation in `ATQForm.jsx` to accept actual CRE ID formats (e.g., alphanumeric, specific lengths, or a more forgiving regex). 
2. **Enable Editing:** Remove the `disabled={!!atqId}` attribute from the `id_cre` input in `ATQForm.jsx` to allow administrators to correct data entry errors.
3. **Handle Unique Constraint Errors:** Ensure `useATQs.js` elegantly handles the PocketBase `400` error if a user attempts to update an `id_cre` to a value that already exists in another record.

### Files Requiring Changes
- `apps/web/src/components/atqs/ATQForm.jsx` (Update validation regex and remove `disabled` attribute)