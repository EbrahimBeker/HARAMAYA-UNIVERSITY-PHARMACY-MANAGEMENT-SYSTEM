# Supplier Catalog Management Guide

## Overview

The Supplier Catalog system allows Drug Suppliers to manage their drug inventory, set prices, and make their products available for pharmacists to order through Purchase Orders.

## Getting Started

### 1. Access Your Catalog

- Login with your Drug Supplier credentials
- Navigate to "Drug Catalog" from the sidebar
- You'll see your catalog dashboard with statistics

### 2. Upload Your Drug Inventory (Recommended)

#### Step 1: Download the Template

- Click the "Template" button to download a CSV template
- The template includes sample data showing the correct format

#### Step 2: Prepare Your File

Open the template in Excel or any spreadsheet software and fill in your drugs:

**Required Columns:**

- `medicine_name`: Name of the medicine (must match existing medicines in the system)
- `unit_price`: Price per unit in ETB (Ethiopian Birr)
- `quantity_available`: How many units you have in stock
- `minimum_order_quantity`: Minimum quantity pharmacists must order
- `notes`: Optional notes about the drug

**Example:**

```csv
medicine_name,unit_price,quantity_available,minimum_order_quantity,notes
Paracetamol,5.50,1000,10,Pain reliever and fever reducer
Amoxicillin,12.00,500,5,Antibiotic for bacterial infections
Ibuprofen,8.75,750,10,Anti-inflammatory and pain reliever
```

**Important Notes:**

- Medicine names must match exactly (or partially) with medicines already in the system
- The system will search for medicines by name or generic name
- If a medicine is not found, that row will be skipped with an error message
- Prices should be in decimal format (e.g., 5.50, not 5.5 ETB)
- Quantities should be whole numbers

#### Step 3: Upload Your File

- Click "Upload Excel/CSV" button
- Select your prepared file (.xlsx, .xls, or .csv)
- Wait for the upload to complete
- You'll see a success message showing how many items were added/updated
- If there are errors, check the browser console for details

### 3. Add Items Manually

If you prefer to add items one by one:

1. Click "Add Item" button
2. Fill in the form:
   - Select medicine from dropdown
   - Enter unit price
   - Enter quantity available
   - Set minimum order quantity (default: 1)
   - Add optional notes
   - Check "Available for Order" if ready to sell
3. Click "Add Item" to save

### 4. Edit Existing Items

- Click the edit icon (pencil) next to any item
- Update the information
- Click "Update Item" to save changes

### 5. Delete Items

- Click the delete icon (trash) next to any item
- Confirm the deletion
- The item will be removed from your catalog

## Managing Purchase Orders

### View Orders

- Navigate to "Purchase Orders" from the sidebar
- See all orders from pharmacists
- View order status: Pending, Confirmed, or Delivered

### Confirm Orders

1. Review the order details
2. Check if you have sufficient stock
3. Click "Confirm Order" if you can fulfill it
4. The order status changes to "Confirmed"

### Mark as Delivered

1. After shipping/delivering the order
2. Click "Mark as Delivered"
3. The order status changes to "Delivered"
4. Pharmacist will receive the stock

## Dashboard Statistics

Your dashboard shows:

- **Total Orders**: All orders received
- **Pending Orders**: Orders waiting for your confirmation
- **Delivered Orders**: Successfully completed orders
- **Total Revenue**: Sum of all delivered orders

## Catalog Statistics

Your catalog page shows:

- **Total Items**: Number of drugs in your catalog
- **Available Items**: Drugs marked as available for order
- **Total Inventory Value**: Total value of your stock (price × quantity)

## Best Practices

1. **Keep Inventory Updated**: Regularly update quantities to reflect actual stock
2. **Accurate Pricing**: Ensure prices are competitive and accurate
3. **Quick Response**: Confirm orders promptly to maintain good relationships
4. **Stock Availability**: Mark items as unavailable when out of stock
5. **Bulk Upload**: Use Excel upload for initial setup or large updates
6. **Regular Review**: Check your catalog weekly for accuracy

## Troubleshooting

### Upload Issues

**Problem**: "Supplier ID not found"

- **Solution**: Refresh the page and try again. If persists, contact admin.

**Problem**: "Medicine not found" errors

- **Solution**: Check medicine names match exactly with system medicines. Contact admin to add new medicines.

**Problem**: File upload fails

- **Solution**:
  - Ensure file is .xlsx, .xls, or .csv format
  - Check file size is under 5MB
  - Verify all required columns are present
  - Check for special characters in medicine names

### Order Management Issues

**Problem**: Can't see orders

- **Solution**: Ensure you're logged in as Drug Supplier and your account is linked to a supplier company.

**Problem**: Can't confirm orders

- **Solution**: Check your permissions with admin. Ensure you have the correct role.

## Support

For technical issues or questions:

- Contact system administrator
- Check that your user account is properly linked to a supplier company
- Verify you have "Drug Supplier" role assigned

## Workflow Summary

```
1. Upload Drug Catalog (CSV/Excel)
   ↓
2. Pharmacist Creates Purchase Order
   ↓
3. You Receive Order (Pending)
   ↓
4. Review & Confirm Order
   ↓
5. Prepare & Ship Order
   ↓
6. Mark as Delivered
   ↓
7. Pharmacist Receives Stock
```

## File Format Reference

### CSV Template Structure

```
medicine_name,unit_price,quantity_available,minimum_order_quantity,notes
[Drug Name],[Price],[Quantity],[Min Order],[Optional Notes]
```

### Supported File Types

- Excel 2007+ (.xlsx)
- Excel 97-2003 (.xls)
- Comma-Separated Values (.csv)

### Column Mapping

The system accepts multiple column name variations:

- Medicine: `medicine_name`, `Medicine`, `medicine`
- Price: `unit_price`, `price`, `Price`
- Quantity: `quantity_available`, `quantity`, `Quantity`
- Min Order: `minimum_order_quantity`, `min_quantity`
- Notes: `notes`, `Notes`

---

**Last Updated**: April 2026
**Version**: 1.0
