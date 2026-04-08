# Supplier Management Guide

## Overview

Only suppliers with linked user accounts can receive Purchase Orders. All other suppliers are for manual Stock In only.

## Supplier Visibility Rules

### For Purchase Orders

Only suppliers that meet ALL criteria:

1. Created by Admin
2. Have a linked Drug Supplier user account (user_id IS NOT NULL)
3. Are active

**Example**: Ethiopian Pharmaceuticals (linked to user "supplier") ✓

### For Stock In (Manual)

Pharmacists see:

1. All Admin suppliers (with or without user accounts)
2. Their own local suppliers
3. Legacy suppliers

## Supplier Types

### Admin Suppliers WITH User Accounts

- Visible in Purchase Orders dropdown
- Supplier can log in to confirm orders
- Example: Ethiopian Pharmaceuticals → user "supplier"

### Admin Suppliers WITHOUT User Accounts

- Only in Stock In dropdown
- Admin can link them later
- Example: Cadila, FMHACA

### Pharmacist Local Suppliers

- Only in Stock In for that pharmacist
- Quick entry for informal suppliers
- No login access

## Admin Workflow - Setup for Purchase Orders

1. Create Drug Supplier user account
2. Create supplier company
3. Link supplier to user account (in Suppliers page)
4. Supplier now appears in Purchase Orders

## Current Example

- **Ethiopian Pharmaceuticals** (user_id=12) → Purchase Orders ✓
- **Cadila** (no user_id) → Stock In only
- **FMHACA** (no user_id) → Stock In only

**Drug Supplier Login**: username "supplier" can log in to view/confirm orders for Ethiopian Pharmaceuticals
