# QUICK_START_CARD.md

**Purpose:** Single-page reference for rapid session startup. Print or keep open in second monitor.

---

## 🏃 30-Second Session Start

### **Before Opening AI:**
1. ☐ Backup DB: `pg_dump > backup_$(date +%Y%m%d).sql`
2. ☐ Pull latest from GitHub (if applicable)
3. ☐ Check Replit is running: `https://harriswildlands.com/api/health`

### **Starting Fresh AI Session:**
1. Copy `FRESH_AI_HANDOFF.md` → Paste to AI
2. AI confirms understanding → Begin session
3. AI completes work → Update `REPLIT_UPDATE_PROMPT.md`

### **Starting Continued AI Session:**
1. "Read `REPLIT_UPDATE_PROMPT.md` current session brief"
2. "Execute the plan"
3. "Update the handoff for next session"

---

## 📋 Current Sprint Status

**Deadline:** [Teaching Starts Date]  
**Sessions Remaining:** [Number]  
**Current Priority:** [P0/P1/P2 Update Name]

### **P0 Updates (Must Ship):**
- [ ] Enhanced LifeOps (morning/evening logs)
- [ ] Database schema migration
- [ ] API routes update
- [ ] Weekly export fix
- [ ] Production auth verification

### **Current Session:**
**SESSION [N]:** [Update Name]  
**Status:** Not Started / In Progress / Complete / Blocked  
**Time Box:** 25 minutes  
**Next Session:** [Update Name]

---

## 🛠️ Essential Commands

### **Replit Shell:**
```bash
# Database
npm run db:push              # Apply schema changes
pg_dump > backup.sql         # Backup database

# Development
npm run dev                  # Start dev server
npm run build               # Build for production
npm run start               # Run production build

# Testing
curl http://localhost:5000/api/health  # Health check
```

### **Git (if using):**
```bash
git add .
git commit -m "SESSION [N]: [brief description]"
git push origin main
```

---

## 🎯 Session Success Checklist

After each session, verify:
- [ ] Code compiles without errors
- [ ] Replit webview shows expected behavior
- [ ] Database has expected data (check DB viewer)
- [ ] No console errors in browser dev tools
- [ ] `REPLIT_UPDATE_PROMPT.md` updated with results
- [ ] Next session brief prepared

---

## 🆘 Emergency Contacts

**If Stuck for >10 min:**
1. Document the blocker in session notes
2. Mark session as BLOCKED
3. Move to next session (don't waste time)
4. Circle back after fresh perspective

**Rollback Procedure:**
```bash
# Database
pg_restore -U postgres -d harriswildlands backup_[date].sql

# Code (Replit version history)
Click file → History → Restore previous version
```

---

## 💡 Session Flow (25 min)

```
0:00 - 0:02   Read session brief
0:02 - 0:05   Understand files/changes needed
0:05 - 0:18   Execute plan (make changes)
0:18 - 0:22   Test & verify
0:22 - 0:25   Document & prepare next handoff
```

**Pomodoro Break:** 5 minutes between sessions (walk, water, stretch)

---

## 🎪 Council Quick Reference

When making decisions, consider:

**Pragmatic Engineer:** "Will this break production?"  
**Product Manager:** "Does this add user value?"  
**Data Scientist:** "Can we actually use this data?"  
**Psychologist:** "Does this change behavior?"  
**Architect:** "Will this scale?"  
**Replit Specialist:** "Replit-specific gotchas?"

**Default:** When in doubt, ship the simplest thing that works.

---

## 📊 Definition of Done

A session is COMPLETE when:
- ✅ All success criteria met
- ✅ Tested in Replit webview
- ✅ No errors in console/logs
- ✅ Database changes verified
- ✅ Handoff documented
- ✅ Next session prepped

A session is BLOCKED when:
- ❌ Blocker encountered (>10 min stuck)
- ❌ Missing information/clarification needed
- ❌ Unexpected technical issue
- ❌ Scope creep detected

---

## 🔥 Focus Mantras

- **"Ship, don't perfect"** - Working > Beautiful
- **"One thing at a time"** - Finish before starting next
- **"Test as you go"** - Don't batch testing
- **"Document the pain"** - Future you will thank you
- **"25 minutes only"** - Timeboxing prevents burnout

---

## 📞 Pre-Session Questions

Ask yourself before starting:
1. What ONE thing am I building this session?
2. How will I know it's done?
3. What's the rollback if it breaks?
4. Do I have 25 uninterrupted minutes?
5. Is the session brief clear?

If any answer is unclear → Clarify BEFORE coding.

---

## 🎓 Common Session Patterns

### **Pattern 1: Schema Change**
1. Update `shared/schema.ts`
2. Run `npm run db:push`
3. Verify in Replit DB viewer
4. Update storage functions in `server/storage.ts`
5. Test API endpoint with curl

### **Pattern 2: UI Component**
1. Create component in `client/src/components/`
2. Import into page
3. Test in Replit webview
4. Verify state management works
5. Check mobile responsiveness

### **Pattern 3: API Endpoint**
1. Add route contract in `shared/routes.ts`
2. Implement in `server/routes.ts`
3. Add storage function in `server/storage.ts`
4. Test with curl
5. Integrate with frontend

---

**Printed:** [Date]  
**Keep This Visible During Sessions**
