# Manual Save Testing Guide

## Quick Start Testing

### 1. Start the Application

```bash
# Option A: Using Docker (recommended)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Option B: Manual start
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 2. Open Browser DevTools
- Open Chrome/Firefox DevTools (F12)
- Go to **Network** tab
- Filter by "XHR" or "Fetch" to see API calls

### 3. Navigate to Management Page
1. Login as InterWorks user
2. Select a migration with management enabled
3. Click "Management" or navigate to `/migration/:id/management`

---

## Test Scenarios

### ✅ Test 1: Text Input (Main Issue)

**Before fix**: Every keystroke triggers API call
**After fix**: No API calls until save button clicked

**Steps:**
1. Open Network tab in DevTools
2. Find a text input field (e.g., delta notes, text questions)
3. Type "Hello World" (11 keystrokes including space)
4. **Expected**:
   - ❌ No API calls to `/management/questions/...`
   - ✅ "Save Changes" button becomes enabled
   - ✅ Status shows "Unsaved changes"
5. Click "Save Changes"
6. **Expected**:
   - ✅ Single API call to `/management/batch-update`
   - ✅ Button shows "Saving..." with spinner
   - ✅ After save: "Saved at HH:MM" appears
   - ✅ Button changes to "Saved" and is disabled

**Console checks:**
```javascript
// Should see ONE log like this after clicking save:
[BATCH UPDATE] Processing 15 questions
[BATCH UPDATE] Successfully updated 3 questions
```

---

### ✅ Test 2: Multiple Checkbox Changes

**Steps:**
1. Clear Network tab
2. Click 5 different checkboxes across different sections
3. **Expected**:
   - ❌ No API calls during clicking
   - ✅ "Save Changes" button enabled
4. Click "Save Changes"
5. **Expected**:
   - ✅ Single `/batch-update` call
   - ✅ All 5 checkboxes saved

---

### ✅ Test 3: Delta Items (Mixed Behavior)

**Steps:**
1. Click "Add Delta" button
   - **Expected**: ✅ Immediate API call (create operation)
   - **Expected**: ✅ Toast: "Delta added"

2. Type in delta name field
   - **Expected**: ❌ No API call during typing
   - **Expected**: ✅ "Save Changes" button appears

3. Check delta checkbox
   - **Expected**: ❌ No API call
   - **Expected**: ✅ "Save Changes" still enabled

4. Click "Save Changes"
   - **Expected**: ✅ Single `/batch-update` call saves delta changes

5. Click "Remove Delta" (trash icon)
   - **Expected**: ✅ Immediate API call (delete operation)
   - **Expected**: ✅ Toast: "Delta removed"

---

### ✅ Test 4: Navigation Protection (React Router)

**Steps:**
1. Make changes (type something, don't save)
2. Click "Overview" button in toolbar
3. **Expected**:
   - ✅ Modal appears: "You have unsaved changes"
   - ✅ Three buttons: "Save & Continue", "Discard Changes", "Cancel"

4. Click "Cancel"
   - **Expected**: ✅ Modal closes, stays on page

5. Try navigation again, click "Discard Changes"
   - **Expected**: ✅ Navigates away without saving

6. Go back, make changes, try navigation, click "Save & Continue"
   - **Expected**:
     - ✅ Saves changes (API call)
     - ✅ Then navigates to new page

---

### ✅ Test 5: Browser Navigation Protection

**Steps:**
1. Make changes (don't save)
2. Try to close tab or refresh page (Ctrl+R or Cmd+R)
3. **Expected**:
   - ✅ Browser shows warning dialog
   - ✅ "Changes you made may not be saved"

4. Cancel the dialog
   - **Expected**: ✅ Stays on page

5. Save changes, then try to close/refresh
   - **Expected**: ❌ No warning (changes saved)

---

### ✅ Test 6: Save Button States

**Steps:**
1. Load management page
   - **Expected**: ✅ Button shows "Saved" and is disabled

2. Make any change
   - **Expected**:
     - ✅ Button shows "Save Changes" and is enabled
     - ✅ Button has primary color (purple)

3. Click "Save Changes"
   - **Expected** (during save):
     - ✅ Button shows "Saving..." with spinner
     - ✅ Button is disabled

4. After save completes
   - **Expected**:
     - ✅ Button shows "Saved" and is disabled
     - ✅ Status shows "Saved at 3:45 PM" (or current time)

---

### ✅ Test 7: Error Handling

**Steps:**
1. Turn off backend server (or disconnect network)
2. Make changes
3. Click "Save Changes"
4. **Expected**:
   - ✅ Error message appears in SaveStatus
   - ✅ "Retry" button appears
   - ✅ Changes remain in local state

5. Turn backend back on
6. Click "Retry"
   - **Expected**: ✅ Saves successfully

---

### ✅ Test 8: Weekly Notes (Should Still Auto-Save)

**Steps:**
1. Add a weekly note
   - **Expected**: ✅ Immediate save (toast: "Note added")

2. Edit a weekly note
   - **Expected**: ✅ Immediate save

3. Delete a weekly note
   - **Expected**: ✅ Immediate save

**Note**: Weekly notes remain auto-save (independent feature)

---

## Network Traffic Verification

### Before Fix
Open Network tab and type 10 characters:
- **Expect to see**: 10 PUT requests to `/management/questions/...`
- **Total requests**: 10

### After Fix
Open Network tab and type 10 characters, then click save:
- **During typing**: 0 requests
- **After save**: 1 PUT request to `/management/batch-update`
- **Total requests**: 1

**Performance improvement: 90-99% reduction in API calls**

---

## Console Log Verification

### ❌ Should NOT See (during typing)
```
[FETCH] Loading management data...
[QUESTION UPDATE] Updating question...
Multiple toast notifications
```

### ✅ Should See (on save button click)
```
[BATCH UPDATE] Processing 15 questions
[BATCH UPDATE] Successfully updated 3 questions
```

---

## Advanced Testing

### Test: Concurrent Section Edits

1. Expand multiple sections
2. Make changes in Section A (checkbox)
3. Make changes in Section B (text input)
4. Make changes in Section C (delta)
5. Click "Save Changes"
6. **Expected**: All sections saved in one batch

### Test: Save State Persistence

1. Make changes
2. Save changes (verify "Saved at HH:MM")
3. Make more changes
4. **Expected**:
   - ✅ "Saved at HH:MM" changes to "Unsaved changes"
   - ✅ Last saved time still visible in status

### Test: Multiple Users (if possible)

1. User A makes changes (doesn't save)
2. User B makes changes and saves
3. User A clicks save
4. **Expected**:
   - ✅ User A's changes overwrite (last save wins)
   - ✅ User A sees their changes reflected

---

## Performance Metrics to Track

### Before Implementation
- API Calls per 100 keystrokes: **100**
- Network payload: **100 × request size**
- Database operations: **100 writes**
- User experience: Laggy, losing focus

### After Implementation
- API Calls per 100 keystrokes: **0** (during typing)
- API Calls per save: **1**
- Network payload: **1 × batch request**
- Database operations: **1 batch write**
- User experience: Smooth, maintains focus

---

## Common Issues to Check

### Issue: Save button doesn't appear
- **Check**: Are you making changes that trigger `hasUnsavedChanges`?
- **Check**: Look at React DevTools for hook state

### Issue: API calls still happening on keystroke
- **Check**: Make sure you're on the dev branch with latest code
- **Check**: Clear browser cache and rebuild

### Issue: Changes lost after save
- **Check**: Backend logs for errors
- **Check**: Network response includes updated data

### Issue: Modal appears when no changes made
- **Check**: `hasUnsavedChanges` state in React DevTools
- **Check**: `managementRef.current` matches `management` state

---

## Success Criteria Checklist

- [ ] No API calls during typing in text fields
- [ ] No API calls when clicking checkboxes
- [ ] Single batch API call when save button clicked
- [ ] Save button shows correct states (Saved/Save Changes/Saving...)
- [ ] SaveStatus component shows accurate status
- [ ] Navigation protection modal appears with unsaved changes
- [ ] Browser warning appears on close/refresh with unsaved changes
- [ ] Error handling with retry button works
- [ ] Delta add/remove still work with immediate save
- [ ] Weekly notes still auto-save
- [ ] No console errors
- [ ] No performance degradation
- [ ] User sees "Saved at HH:MM" after successful save

---

## Rollback Plan

If issues are found:

```bash
# Revert changes
git checkout HEAD~1 frontend/src/hooks/useManagement.js
git checkout HEAD~1 frontend/src/pages/MigrationManagement.jsx
git checkout HEAD~1 backend/src/routes/migrations.js

# Rebuild
docker-compose down
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

---

## Next Steps After Testing

1. **If all tests pass**:
   - Commit changes with descriptive message
   - Create pull request
   - Deploy to staging
   - Monitor production logs

2. **If issues found**:
   - Document specific failures
   - Check browser console for errors
   - Review network requests
   - Check backend logs
   - File bug report with reproduction steps
