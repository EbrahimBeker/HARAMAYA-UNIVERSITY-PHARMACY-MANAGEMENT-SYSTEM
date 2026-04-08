# Quick Start Guide - New Workflow Features

## 🎉 What's New?

Your Haramaya University Pharmacy Management System now has 4 powerful new features:

1. **Prescription Refills** - Allow patients to refill prescriptions without seeing physician
2. **Emergency Dispensing** - Dispense medicine in emergencies without prescription
3. **Partial Dispensing** - Handle out-of-stock situations gracefully
4. **Patient History** - View patient's prescription history

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Start the System

```bash
# Terminal 1 - Start Backend
cd api
npm start

# Terminal 2 - Start Frontend
cd frontend
npm run dev
```

### Step 2: Test Refill Feature

1. Login as **Physician** (`physician` / `physician123`)
2. Create a new prescription
3. Set **Refills Allowed** to `2`
4. Save prescription

5. Login as **Pharmacist** (`pharmacist` / `pharma123`)
6. Go to **Drug Dispensing**
7. See prescription with "2 refills left" badge
8. Click **Refill** button
9. ✅ New prescription created automatically!

### Step 3: Test Emergency Dispensing

1. Stay logged in as **Pharmacist**
2. Click **Emergency Dispensing** (red button)
3. Enter patient ID: `PAT000001`
4. Click **Search** to auto-fill name
5. Select a medicine
6. Enter quantity and reason
7. Click **Record Emergency Dispensing**
8. ✅ Medicine dispensed, pending physician prescription!

---

## 📖 Feature Guides

### Feature 1: Prescription Refills

**For Physicians:**

- When creating prescription, select refills from dropdown
- Options: 0, 1, 2, 3, 6, or 12 refills
- Use 6-12 for chronic medications
- Use 0 for controlled substances

**For Pharmacists:**

- Prescriptions with refills show badge: "X refills left"
- Click "Refill" button to create new prescription
- System automatically decrements refill count
- When refills = 0, button disappears

**Benefits:**

- Patients don't need to see physician for refills
- Faster service for chronic medications
- Reduces physician workload

---

### Feature 2: Emergency Dispensing

**When to Use:**

- Patient needs urgent medicine
- No time to see physician first
- Genuine medical emergency only

**How to Use:**

1. Go to Emergency Dispensing page
2. Enter patient information
3. Select medicine and quantity
4. Document reason thoroughly
5. Submit form

**Important:**

- ⚠️ Physician prescription REQUIRED within 48 hours
- System tracks time elapsed
- Color codes: Green (<24h), Yellow (<48h), Red (>48h)
- Controlled substances NOT allowed

**For Physicians:**

- View pending emergency dispensing on dashboard
- Create linked prescription within 48 hours
- System auto-fills patient and medicine info

---

### Feature 3: Partial Dispensing (Backend Ready)

**Use Case:**

- Medicine out of stock
- Can only dispense partial quantity

**How It Works:**

- Pharmacist dispenses available quantity
- System tracks remaining quantity
- Prescription status: "Partial"
- Patient returns for remainder when stock arrives

**Status:** Backend complete, UI coming soon

---

### Feature 4: Patient History (Backend Ready)

**Use Case:**

- Physician wants to see previous prescriptions
- Check treatment effectiveness
- Review medication history

**How It Works:**

- Click "View History" when patient selected
- See all previous prescriptions
- View medicines, dosages, dates
- Copy previous prescription as template

**Status:** Backend complete, UI coming soon

---

## 🎯 Common Workflows

### Workflow 1: Patient with Chronic Condition

1. **First Visit:**
   - Physician creates prescription with 12 refills
   - Pharmacist dispenses medicine
   - Patient receives 1-month supply

2. **Monthly Refills (Next 12 months):**
   - Patient goes directly to pharmacy
   - Pharmacist clicks "Refill"
   - New prescription created automatically
   - Patient gets medicine without seeing physician

3. **After 12 Refills:**
   - Patient must see physician for new prescription
   - Physician evaluates treatment effectiveness
   - Creates new prescription with refills if needed

### Workflow 2: Emergency Situation

1. **Emergency Occurs:**
   - Patient arrives with severe pain
   - No prescription available
   - Pharmacist uses Emergency Dispensing

2. **Immediate Action:**
   - Pharmacist records emergency dispensing
   - Documents reason thoroughly
   - Dispenses medicine immediately
   - Patient gets relief

3. **Follow-up (Within 48 hours):**
   - Patient sees physician
   - Physician creates prescription
   - Links to emergency dispensing record
   - System marks as complete

### Workflow 3: Medicine Out of Stock

1. **Prescription Received:**
   - Pharmacist checks stock
   - Medicine partially available
   - Only 10 tablets, need 30

2. **Partial Dispensing:**
   - Dispense 10 tablets now
   - System tracks 20 remaining
   - Patient pays for 10 only

3. **Stock Arrives:**
   - Pharmacist adds stock
   - Patient returns
   - Dispense remaining 20 tablets
   - Prescription marked complete

---

## 🔧 Troubleshooting

### Issue: Refill button not showing

**Solution:** Check if prescription has refills_remaining > 0

### Issue: Emergency dispensing fails

**Solution:** Check medicine stock availability

### Issue: Can't create prescription with refills

**Solution:** Ensure you're logged in as Physician

### Issue: Database error

**Solution:** Verify migration was run successfully

---

## 📊 System Status Check

Run these checks to verify everything is working:

### Check 1: Database

```sql
-- Check if new columns exist
DESCRIBE prescriptions;
-- Should show: refills_allowed, refills_remaining, is_partial_dispensed

DESCRIBE emergency_dispensing;
-- Should show table structure

DESCRIBE prescription_items;
-- Should show: quantity_remaining, is_partial
```

### Check 2: Backend

```bash
# Check if server is running
curl http://localhost:5000/health

# Should return: {"status":"OK","message":"Haramaya Pharmacy API is running"}
```

### Check 3: Frontend

- Open http://localhost:5173
- Login as Pharmacist
- Check if "Emergency Dispensing" button exists
- Check if refill badges show on prescriptions

---

## 📞 Support

### For Technical Issues:

1. Check console for errors (F12 in browser)
2. Check backend logs in terminal
3. Verify database migration ran successfully
4. Restart both frontend and backend

### For Feature Questions:

- Refer to PATIENT_WORKFLOW_GUIDE.md
- Check IMPLEMENTATION_COMPLETE_SUMMARY.md
- Review API documentation

---

## 🎓 Training Resources

### For Physicians:

- How to set appropriate refill counts
- When to allow refills vs. require follow-up
- Reviewing patient prescription history

### For Pharmacists:

- When to use emergency dispensing
- How to handle partial dispensing
- Monitoring pending emergency prescriptions

### For Data Clerks:

- No changes to workflow
- Continue normal patient registration

---

## ✅ Success Checklist

Before going live, verify:

- [ ] Database migration completed
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Can create prescription with refills
- [ ] Can refill prescription
- [ ] Can record emergency dispensing
- [ ] Emergency dispensing shows in pending list
- [ ] Navigation links work
- [ ] No console errors
- [ ] All users can login
- [ ] Tested with real data

---

## 🚀 Go Live Checklist

1. [ ] Backup database
2. [ ] Run migration on production
3. [ ] Deploy backend
4. [ ] Deploy frontend
5. [ ] Test all features
6. [ ] Train staff
7. [ ] Monitor for issues
8. [ ] Collect feedback

---

## 📈 Expected Benefits

### For Patients:

- ✅ Faster refills (no physician visit needed)
- ✅ Emergency medicine access
- ✅ Better continuity of care

### For Physicians:

- ✅ Reduced workload (fewer refill visits)
- ✅ Better patient history visibility
- ✅ More time for complex cases

### For Pharmacists:

- ✅ Streamlined refill process
- ✅ Emergency dispensing capability
- ✅ Better stock management

### For System:

- ✅ Complete audit trail
- ✅ Regulatory compliance
- ✅ Improved efficiency

---

**Ready to use!** 🎉

Start with the refill feature - it's the easiest to test and provides immediate value.

Questions? Check the documentation files or test in a safe environment first.

---

**Version:** 1.0
**Last Updated:** April 8, 2026
**Status:** Production Ready (2 of 4 features complete)
