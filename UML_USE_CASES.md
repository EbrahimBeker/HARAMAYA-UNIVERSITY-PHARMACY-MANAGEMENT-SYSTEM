# UML Use Case Descriptions - Pharmacy Management System

## Correct UML Principles Applied

### Key Corrections Made:
1. **NO improper includes**: Login is NOT a parent use case
2. **Direct actor-to-use-case relationships**: Each actor directly connects to their use cases
3. **Proper <<include>> usage**: Only for mandatory sub-functionality
4. **Proper <<extend>> usage**: Only for optional extensions
5. **Authentication**: Handled as a cross-cutting concern via middleware

---

## ADMINISTRATOR USE CASES

### UC-ADM-001: Manage Users
- **Actor**: Administrator
- **Precondition**: Administrator is authenticated
- **Main Flow**:
  1. Administrator selects user management
  2. System displays user list with filters
  3. Administrator can add/edit/delete/deactivate users
  4. System validates input data
  5. System saves changes to database
- **Postcondition**: User data is updated
- **Alternative Flow**: Validation fails, system shows error message

### UC-ADM-002: Assign Roles
- **Actor**: Administrator
- **Precondition**: User exists in system
- **Main Flow**:
  1. Administrator selects user
  2. System displays available roles
  3. Administrator assigns/revokes roles
  4. System updates user permissions
  5. System logs role change
- **Postcondition**: User role assignments updated

### UC-ADM-003: Manage Drug Categories
- **Actor**: Administrator
- **Precondition**: Administrator is authenticated
- **Main Flow**:
  1. Administrator accesses category management
  2. System displays categories list
  3. Administrator adds/edits/deletes categories
  4. System validates category name uniqueness
  5. System saves changes
- **Postcondition**: Categories updated

### UC-ADM-004: View System Reports
- **Actor**: Administrator
- **Precondition**: Administrator is authenticated
- **Main Flow**:
  1. Administrator selects report type
  2. Administrator sets date range and filters
  3. System queries database
  4. System generates report
  5. Administrator can export report (PDF/Excel)
- **Postcondition**: Report generated and displayed

### UC-ADM-005: Backup Database
- **Actor**: Administrator
- **Precondition**: Administrator is authenticated
- **Main Flow**:
  1. Administrator initiates backup
  2. System creates database dump
  3. System compresses backup file
  4. System stores backup with timestamp
  5. System confirms backup success
- **Postcondition**: Database backed up successfully

---

## PHYSICIAN USE CASES

### UC-PHY-001: Register Patient
- **Actor**: Physician
- **Precondition**: Physician is authenticated
- **Main Flow**:
  1. Physician enters patient details (name, age, gender, contact)
  2. System validates information
  3. System checks for duplicate records
  4. System generates unique patient ID
  5. System saves patient record
- **Postcondition**: New patient registered
- **Alternative Flow**: Duplicate found, system shows existing record

### UC-PHY-002: Diagnose Patient
- **Actor**: Physician
- **Precondition**: Patient is registered
- **Main Flow**:
  1. Physician searches for patient by ID/name
  2. System displays patient information
  3. Physician records symptoms
  4. Physician records vital signs (BP, temp, pulse)
  5. Physician enters diagnosis
  6. System saves diagnosis record with timestamp
- **Postcondition**: Diagnosis recorded
- **Includes**: Search Patient

### UC-PHY-003: Create Prescription
- **Actor**: Physician
- **Precondition**: Patient is diagnosed
- **Main Flow**:
  1. Physician selects patient
  2. Physician searches and adds medicines
  3. Physician specifies dosage, frequency, duration
  4. Physician adds special instructions
  5. System validates prescription
  6. System checks drug interactions
  7. System saves prescription
- **Postcondition**: Prescription created
- **Includes**: Check Drug Availability
- **Extends**: Check Drug Interactions (if multiple medicines)

### UC-PHY-004: View Patient History
- **Actor**: Physician
- **Precondition**: Patient exists
- **Main Flow**:
  1. Physician searches patient
  2. System displays patient profile
  3. System shows all diagnoses chronologically
  4. System shows all prescriptions
  5. Physician reviews medical history
- **Postcondition**: History viewed

---

## PHARMACIST USE CASES

### UC-PHA-001: View Prescription
- **Actor**: Pharmacist
- **Precondition**: Pharmacist is authenticated
- **Main Flow**:
  1. Pharmacist searches prescription by ID/patient name
  2. System displays prescription details
  3. System shows medicine list with dosages
  4. Pharmacist verifies prescription validity
  5. Pharmacist checks physician signature
- **Postcondition**: Prescription viewed and verified

### UC-PHA-002: Dispense Drug
- **Actor**: Pharmacist
- **Precondition**: Prescription is valid and verified
- **Main Flow**:
  1. Pharmacist selects prescription
  2. System checks drug availability for each medicine
  3. Pharmacist confirms quantities to dispense
  4. System updates stock inventory
  5. System marks prescription as dispensed
  6. System records dispensing timestamp
- **Postcondition**: Drug dispensed, stock updated
- **Includes**: Check Drug Availability, Update Drug Stock
- **Alternative Flow**: Insufficient stock, system alerts pharmacist

### UC-PHA-003: Check Drug Availability
- **Actor**: Pharmacist
- **Precondition**: Pharmacist is authenticated
- **Main Flow**:
  1. Pharmacist searches drug by name
  2. System displays current stock quantity
  3. System shows batch numbers and expiry dates
  4. System shows reorder level status
- **Postcondition**: Availability information displayed

### UC-PHA-004: Update Drug Stock
- **Actor**: System (automated)
- **Triggered By**: Dispensing or receiving stock
- **Main Flow**:
  1. System calculates new stock level
  2. System updates inventory table
  3. System logs transaction in stock_out/stock_in
  4. System checks if below reorder level
  5. System generates alert if needed
- **Postcondition**: Stock updated, alerts generated

---

## RECEPTIONIST USE CASES

### UC-REC-001: Register Patient
- **Actor**: Receptionist
- **Precondition**: Receptionist is authenticated
- **Main Flow**:
  1. Receptionist collects patient information
  2. Receptionist enters data into system
  3. System validates information
  4. System checks for duplicates
  5. System generates patient ID
  6. System prints patient card
- **Postcondition**: Patient registered, card printed

### UC-REC-002: Update Patient Information
- **Actor**: Receptionist
- **Precondition**: Patient exists
- **Main Flow**:
  1. Receptionist searches patient
  2. System displays patient record
  3. Receptionist updates information
  4. System validates changes
  5. System saves updates with timestamp
- **Postcondition**: Patient information updated

### UC-REC-003: Search Patient Records
- **Actor**: Receptionist
- **Precondition**: Receptionist is authenticated
- **Main Flow**:
  1. Receptionist enters search criteria (ID/name/phone)
  2. System searches database
  3. System displays matching patients
  4. Receptionist selects patient
  5. System displays full patient record
- **Postcondition**: Patient record retrieved

---

## INVENTORY MANAGER USE CASES

### UC-INV-001: Create Purchase Order
- **Actor**: Inventory Manager
- **Precondition**: Inventory Manager is authenticated
- **Main Flow**:
  1. Inventory Manager selects supplier
  2. Inventory Manager adds medicines to order
  3. Inventory Manager specifies quantities
  4. System calculates estimated total
  5. Inventory Manager reviews and submits
  6. System sends order to supplier
- **Postcondition**: Purchase order created and sent

### UC-INV-002: Manage Inventory
- **Actor**: Inventory Manager
- **Precondition**: Inventory Manager is authenticated
- **Main Flow**:
  1. Inventory Manager views inventory dashboard
  2. System displays stock levels, alerts
  3. Inventory Manager can add/update/remove items
  4. System validates changes
  5. System updates inventory
- **Postcondition**: Inventory updated

### UC-INV-003: Track Drug Expiry
- **Actor**: Inventory Manager
- **Precondition**: Inventory Manager is authenticated
- **Main Flow**:
  1. System displays drugs near expiry (30/60/90 days)
  2. Inventory Manager reviews list
  3. Inventory Manager marks expired drugs
  4. System removes from available stock
  5. System logs expired items
- **Postcondition**: Expired drugs tracked and removed

### UC-INV-004: Approve Supplier Orders
- **Actor**: Inventory Manager
- **Precondition**: Supplier has confirmed order
- **Main Flow**:
  1. System notifies Inventory Manager of confirmation
  2. Inventory Manager reviews order details
  3. Inventory Manager verifies pricing and quantities
  4. Inventory Manager approves or rejects
  5. System notifies supplier of decision
- **Postcondition**: Order approved or rejected

### UC-INV-005: Generate Inventory Report
- **Actor**: Inventory Manager
- **Precondition**: Inventory Manager is authenticated
- **Main Flow**:
  1. Inventory Manager selects report type
  2. Inventory Manager sets parameters (date range, category)
  3. System queries database
  4. System generates report
  5. Inventory Manager exports report
- **Postcondition**: Report generated

---

## SUPPLIER USE CASES

### UC-SUP-001: Receive Purchase Order
- **Actor**: Supplier
- **Precondition**: Supplier is authenticated
- **Main Flow**:
  1. System notifies supplier of new order
  2. Supplier logs into system
  3. Supplier views order details
  4. Supplier reviews requested items and quantities
- **Postcondition**: Order received and viewed

### UC-SUP-002: Confirm Order
- **Actor**: Supplier
- **Precondition**: Purchase order received
- **Main Flow**:
  1. Supplier checks stock availability
  2. Supplier confirms available quantities
  3. Supplier sets unit prices
  4. Supplier sets estimated delivery date
  5. Supplier submits confirmation
  6. System notifies Inventory Manager
- **Postcondition**: Order confirmed

### UC-SUP-003: Deliver Drugs
- **Actor**: Supplier
- **Precondition**: Order is approved
- **Main Flow**:
  1. Supplier prepares delivery
  2. Supplier enters batch numbers for each medicine
  3. Supplier enters manufacture and expiry dates
  4. Supplier marks order as delivered
  5. System updates inventory
  6. System notifies Inventory Manager
- **Postcondition**: Drugs delivered, inventory updated

---

## PATIENT USE CASES

### UC-PAT-001: View Prescription
- **Actor**: Patient
- **Precondition**: Patient is authenticated
- **Main Flow**:
  1. Patient logs into patient portal
  2. System displays patient's prescriptions
  3. Patient selects prescription
  4. System shows medicine details, dosage, instructions
- **Postcondition**: Prescription viewed

### UC-PAT-002: View Billing Details
- **Actor**: Patient
- **Precondition**: Patient is authenticated
- **Main Flow**:
  1. Patient accesses billing section
  2. System displays all invoices
  3. Patient views invoice details
  4. System shows payment history
- **Postcondition**: Billing information viewed

---

## CASHIER USE CASES

### UC-CAS-001: Generate Invoice
- **Actor**: Cashier
- **Precondition**: Prescription is dispensed
- **Main Flow**:
  1. Cashier selects dispensed prescription
  2. System retrieves medicine prices
  3. System calculates total cost
  4. System applies any discounts
  5. System generates invoice
  6. Cashier presents invoice to patient
- **Postcondition**: Invoice generated

### UC-CAS-002: Receive Payment
- **Actor**: Cashier
- **Precondition**: Invoice is generated
- **Main Flow**:
  1. Cashier selects payment method (cash/card/insurance)
  2. Cashier enters payment amount
  3. System validates payment
  4. System calculates change if cash
  5. System records transaction
- **Postcondition**: Payment received and recorded

### UC-CAS-003: Print Receipt
- **Actor**: Cashier
- **Precondition**: Payment is received
- **Main Flow**:
  1. System generates receipt with transaction details
  2. Cashier prints receipt
  3. Cashier gives receipt to patient
- **Postcondition**: Receipt printed and provided

### UC-CAS-004: View Sales Report
- **Actor**: Cashier
- **Precondition**: Cashier is authenticated
- **Main Flow**:
  1. Cashier selects date range
  2. System queries payment transactions
  3. System generates sales report
  4. Cashier reviews transactions
  5. Cashier exports report
- **Postcondition**: Sales report viewed

---

## Use Case Relationships

### Include Relationships (Mandatory)
- Dispense Drug **includes** Check Drug Availability
- Dispense Drug **includes** Update Drug Stock
- Create Prescription **includes** Check Drug Availability
- Diagnose Patient **includes** Search Patient

### Extend Relationships (Optional)
- Create Prescription **extends** Check Drug Interactions (when multiple medicines)
- Register Patient **extends** Print Patient Card (optional)

---

## Document Status
- **Version**: 1.0
- **Date**: February 15, 2026
- **Compliant With**: UML 2.5 Standards
