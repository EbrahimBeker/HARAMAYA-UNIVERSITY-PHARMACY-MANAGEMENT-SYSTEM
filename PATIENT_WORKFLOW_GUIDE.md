# Complete Patient Workflow Guide

## Haramaya University Pharmacy Management System

---

## 📋 Overview

This guide explains the complete patient journey from registration to medicine dispensing, showing how different roles interact in the system.

---

## 🔄 Complete Patient Journey

```
STEP 1: Registration (Data Clerk)
    ↓
STEP 2: Consultation (Physician)
    ↓
STEP 3: Prescription Creation (Physician)
    ↓
STEP 4: Medicine Dispensing (Pharmacist)
    ↓
STEP 5: Payment & Receipt (Pharmacist)
```

---

## STEP 1: PATIENT REGISTRATION (Data Clerk)

### Role: Data Clerk

**Login:** `clerk` / `clerk123`

### Actions:

1. **Navigate to Patient Registration**
   - Click "Patient Registration" in sidebar
   - Or click "New Patient" button from Patient Records page

2. **Fill Patient Information**

   ```
   Personal Information:
   - First Name: John
   - Last Name: Doe
   - Date of Birth: 1990-01-01
   - Gender: Male

   Contact Information:
   - Phone: +251911234567
   - Email: john.doe@example.com (Optional)
   - Address: Harar, Ethiopia

   Emergency Contact:
   - Name: Jane Doe
   - Phone: +251922345678

   Medical Information:
   - Blood Group: O+
   - Allergies: None (or list specific allergies)
   ```

3. **Process Registration Fee**
   - Registration Fee: 100.00 ETB (Cash Only)
   - Enter Amount Received: e.g., 150.00 ETB
   - System calculates change: 50.00 ETB
   - Click "Register Patient"

4. **Print Receipt**
   - Receipt modal appears automatically
   - Shows patient info and payment details
   - Click "Print" to print receipt
   - Give receipt to patient
   - Click "Close" to finish

5. **Note Patient ID**
   - System generates unique Patient ID (e.g., PAT000001)
   - Patient will use this ID for all future visits
   - Patient can now proceed to see physician

### Output:

- ✅ Patient registered in system
- ✅ Patient ID generated (PAT000001)
- ✅ Registration fee collected
- ✅ Receipt printed
- 🎯 **Next Step:** Patient goes to Physician for consultation

---

## STEP 2: PATIENT CONSULTATION (Physician)

### Role: Physician

**Login:** `physician` / `physician123`

### Actions:

1. **Find Patient Record**
   - Click "Patients" in sidebar
   - Search for patient by:
     - Patient ID (PAT000001)
     - Name (John Doe)
     - Phone number
   - Click "View" to open patient details

2. **Review Patient Information**
   - Check patient demographics
   - Review medical history
   - Note allergies and blood group
   - Check previous prescriptions (if any)

3. **Conduct Consultation**
   - Examine patient
   - Record symptoms and diagnosis
   - Determine treatment plan
   - Decide which medicines to prescribe

### Output:

- ✅ Patient examined
- ✅ Diagnosis determined
- 🎯 **Next Step:** Create prescription for patient

---

## STEP 3: PRESCRIPTION CREATION (Physician)

### Role: Physician

**Login:** `physician` / `physician123`

### Actions:

1. **Create New Prescription**
   - From patient details page
   - Click "Create Prescription" or "New Prescription"
   - Or navigate to Prescriptions section

2. **Add Diagnosis**
   - Select or enter diagnosis
   - Add ICD code if available
   - Enter diagnosis notes

3. **Add Medicines to Prescription**

   ```
   For each medicine:
   - Select Medicine: e.g., Paracetamol 500mg
   - Quantity: 20 tablets
   - Dosage: 1 tablet
   - Frequency: 3 times daily
   - Duration: 7 days
   - Instructions: Take after meals
   ```

4. **Add Multiple Medicines (if needed)**
   - Click "Add Medicine" for each additional medicine
   - Example prescription:
     ```
     Medicine 1: Paracetamol 500mg - 20 tablets
     Medicine 2: Amoxicillin 250mg - 15 capsules
     Medicine 3: Vitamin C 500mg - 30 tablets
     ```

5. **Review and Save Prescription**
   - Verify all medicines and dosages
   - Check for drug interactions
   - Verify against patient allergies
   - Add any special instructions
   - Click "Save Prescription"

6. **Print Prescription**
   - Print prescription for patient
   - Give to patient
   - Patient takes prescription to pharmacy

### Output:

- ✅ Prescription created with medicines
- ✅ Prescription status: "Pending"
- ✅ Prescription printed for patient
- 🎯 **Next Step:** Patient goes to Pharmacy with prescription

---

## STEP 4: MEDICINE DISPENSING (Pharmacist)

### Role: Pharmacist

**Login:** `pharmacist` / `pharma123`

### Actions:

#### 4A: View Pending Prescriptions

1. **Check Dashboard**
   - Login as Pharmacist
   - View "Pending Prescriptions" table on dashboard
   - See list of prescriptions waiting to be dispensed

2. **Or Navigate to Drug Dispensing**
   - Click "Drug Dispensing" in sidebar
   - View all pending prescriptions

#### 4B: Dispense Medicines

1. **Select Patient/Prescription**
   - Search by Patient ID (PAT000001)
   - Or search by patient name
   - Select the prescription to dispense

2. **Verify Prescription Details**
   - Check patient information
   - Review prescribed medicines
   - Verify quantities and dosages
   - Check for any special instructions

3. **Check Medicine Availability**
   - Verify all medicines are in stock
   - Check expiry dates
   - If medicine not available:
     - Inform patient
     - Suggest alternatives (with physician approval)
     - Or partial dispensing

4. **Add Medicines to Cart**
   - Search for each prescribed medicine
   - Add to dispensing cart
   - Verify quantities match prescription
   - System shows:
     - Medicine name and strength
     - Quantity to dispense
     - Unit price
     - Subtotal

5. **Review Total Amount**

   ```
   Example:
   Paracetamol 500mg x 20 = 40.00 ETB
   Amoxicillin 250mg x 15 = 75.00 ETB
   Vitamin C 500mg x 30 = 60.00 ETB
   ─────────────────────────────────
   Total Amount: 175.00 ETB
   ```

6. **Process Payment**
   - Enter amount received from patient
   - System calculates change
   - Example:
     ```
     Total: 175.00 ETB
     Amount Received: 200.00 ETB
     Change: 25.00 ETB
     ```

7. **Complete Dispensing**
   - Click "Complete Dispensing" or "Dispense"
   - System updates:
     - Prescription status: "Pending" → "Dispensed"
     - Inventory: Reduces stock quantities
     - Sales record: Creates transaction
   - Receipt generated automatically

8. **Print Receipt**
   - Receipt shows:
     - Patient information
     - Medicines dispensed with quantities
     - Total amount paid
     - Change given
     - Date and time
     - Pharmacist name
   - Print and give to patient

9. **Provide Medicine Instructions**
   - Give medicines to patient
   - Explain dosage and timing
   - Provide any special instructions
   - Answer patient questions
   - Remind about follow-up if needed

### Output:

- ✅ Medicines dispensed to patient
- ✅ Prescription status: "Dispensed"
- ✅ Inventory updated (stock reduced)
- ✅ Payment collected
- ✅ Receipt printed
- ✅ Patient has medicines and instructions
- 🎯 **Patient Journey Complete!**

---

## STEP 5: FOLLOW-UP & ADDITIONAL SCENARIOS

### Scenario A: Patient Returns for Follow-up

1. **Patient visits again**
   - Uses same Patient ID (PAT000001)
   - No need to re-register
   - Goes directly to Physician

2. **Physician reviews history**
   - Views previous prescriptions
   - Checks treatment effectiveness
   - Creates new prescription if needed

3. **Process repeats from Step 3**

### Scenario B: Refill Prescription

1. **Patient requests refill**
   - Brings old prescription
   - Pharmacist checks if refills allowed
   - If yes: Dispense directly
   - If no: Patient must see Physician

### Scenario C: Medicine Out of Stock

1. **Pharmacist checks inventory**
   - Medicine not available
   - Options:
     a. Partial dispensing (give available quantity)
     b. Suggest alternative (contact Physician)
     c. Patient waits for restock

2. **Pharmacist adds stock**
   - Click "Stock In" in sidebar
   - Select medicine
   - Enter quantity received
   - Select supplier
   - Enter batch number and expiry date
   - Save stock entry

### Scenario D: Emergency Dispensing

1. **Patient needs urgent medicine**
   - Pharmacist can dispense without prescription (if allowed)
   - Must document reason
   - Physician creates prescription later
   - System links prescription to dispensing

---

## 📊 SYSTEM INTERACTIONS BY ROLE

### Data Clerk Responsibilities:

- ✅ Register new patients
- ✅ Update patient information
- ✅ Collect registration fees
- ✅ Maintain patient records
- ✅ Generate patient reports
- ❌ Cannot create prescriptions
- ❌ Cannot dispense medicines

### Physician Responsibilities:

- ✅ View patient records
- ✅ Conduct consultations
- ✅ Create diagnoses
- ✅ Write prescriptions
- ✅ View medicine information
- ❌ Cannot register patients
- ❌ Cannot dispense medicines

### Pharmacist Responsibilities:

- ✅ View pending prescriptions
- ✅ Dispense medicines
- ✅ Manage inventory
- ✅ Add stock (Stock In)
- ✅ Process payments
- ✅ Generate pharmacy reports
- ❌ Cannot register patients
- ❌ Cannot create prescriptions

### Admin Responsibilities:

- ✅ Manage all users
- ✅ View all reports
- ✅ System configuration
- ✅ Backup and restore
- ✅ Full system access

---

## 🔍 TRACKING PATIENT JOURNEY

### For Data Clerk:

```sql
-- View all registered patients
SELECT * FROM patients
WHERE registered_by = [clerk_user_id]
ORDER BY created_at DESC;
```

### For Physician:

```sql
-- View prescriptions created
SELECT * FROM prescriptions
WHERE prescribed_by = [physician_user_id]
ORDER BY prescription_date DESC;
```

### For Pharmacist:

```sql
-- View dispensed prescriptions
SELECT * FROM prescriptions
WHERE status = 'Dispensed'
AND dispensed_by = [pharmacist_user_id]
ORDER BY updated_at DESC;
```

---

## 📈 REPORTS & ANALYTICS

### Data Clerk Reports:

- Total patients registered
- New registrations per day/month
- Patient demographics
- Registration revenue

### Physician Reports:

- Prescriptions created
- Most common diagnoses
- Medicines prescribed
- Patient consultations

### Pharmacist Reports:

- Medicines dispensed
- Revenue from sales
- Low stock alerts
- Expiring medicines
- Popular medicines

### Admin Reports:

- System-wide statistics
- User activity logs
- Financial reports
- Inventory valuation

---

## ⚠️ IMPORTANT NOTES

### Patient ID:

- Generated automatically (PAT000001, PAT000002, etc.)
- Unique for each patient
- Used for all future visits
- Never changes

### Prescription Status:

- **Pending**: Created by physician, not yet dispensed
- **Dispensed**: Medicines given to patient
- **Cancelled**: Prescription cancelled (if needed)

### Payment:

- Registration fee: Collected by Data Clerk (100 ETB)
- Medicine payment: Collected by Pharmacist (varies)
- All payments in ETB (Ethiopian Birr)
- Cash only

### Stock Management:

- Pharmacist monitors stock levels
- Low stock alerts on dashboard
- Reorder when stock is low
- Track expiry dates
- Remove expired medicines

### Data Privacy:

- Patient information is confidential
- Only authorized roles can access
- Audit trail for all actions
- Secure login required

---

## 🎯 QUICK REFERENCE WORKFLOW

```
1. CLERK: Register Patient → Collect 100 ETB → Print Receipt
   Patient ID: PAT000001

2. PHYSICIAN: Find Patient → Examine → Create Prescription
   Prescription ID: RX000001
   Status: Pending

3. PHARMACIST: View Pending → Dispense Medicines → Collect Payment → Print Receipt
   Prescription Status: Dispensed

4. PATIENT: Has medicines and instructions → Treatment complete
```

---

## 📞 TROUBLESHOOTING

### Patient Not Found:

- Verify Patient ID is correct
- Check spelling of name
- Ensure patient was registered
- Check if patient was deleted

### Prescription Not Showing:

- Verify prescription was saved
- Check prescription status
- Ensure correct patient selected
- Refresh the page

### Medicine Out of Stock:

- Check inventory
- Add stock if available
- Contact supplier
- Suggest alternative

### Payment Issues:

- Verify amount entered correctly
- Check change calculation
- Ensure payment processed
- Print receipt for records

---

## ✅ CHECKLIST FOR EACH STEP

### Data Clerk Checklist:

- [ ] Patient information complete
- [ ] Registration fee collected (100 ETB)
- [ ] Receipt printed and given to patient
- [ ] Patient ID noted and given to patient

### Physician Checklist:

- [ ] Patient record reviewed
- [ ] Diagnosis recorded
- [ ] Medicines selected appropriately
- [ ] Dosages and instructions clear
- [ ] Allergies checked
- [ ] Prescription saved and printed

### Pharmacist Checklist:

- [ ] Prescription verified
- [ ] All medicines in stock
- [ ] Quantities correct
- [ ] Expiry dates checked
- [ ] Payment collected
- [ ] Change given correctly
- [ ] Receipt printed
- [ ] Instructions provided to patient
- [ ] Inventory updated

---

## 🎓 TRAINING TIPS

### For New Data Clerks:

1. Practice patient registration with test data
2. Learn to use search function efficiently
3. Understand payment processing
4. Know how to print receipts
5. Familiarize with patient records management

### For New Physicians:

1. Learn patient record system
2. Practice creating prescriptions
3. Understand medicine database
4. Know how to check drug interactions
5. Review prescription history features

### For New Pharmacists:

1. Learn inventory management
2. Practice dispensing workflow
3. Understand stock alerts
4. Know how to add stock
5. Familiarize with reports

---

## 📚 ADDITIONAL RESOURCES

### User Manuals:

- Data Clerk Manual: [Link to detailed manual]
- Physician Manual: [Link to detailed manual]
- Pharmacist Manual: [Link to detailed manual]
- Admin Manual: [Link to detailed manual]

### Video Tutorials:

- Patient Registration Process
- Creating Prescriptions
- Dispensing Medicines
- Inventory Management

### Support:

- Technical Support: [Contact info]
- Training Sessions: [Schedule]
- FAQ: [Link to FAQ]

---

**Last Updated:** [Current Date]
**Version:** 1.0
**System:** Haramaya University Pharmacy Management System

---

**Remember:** The patient's health and safety are the top priority. Always verify information carefully and follow proper procedures!
