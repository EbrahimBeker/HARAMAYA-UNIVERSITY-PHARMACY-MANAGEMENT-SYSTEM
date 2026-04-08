/**
 * Create a test Excel file for supplier catalog upload
 */

const xlsx = require("xlsx");
const path = require("path");

// Sample drug data
const drugData = [
  {
    medicine_name: "Paracetamol",
    unit_price: 5.5,
    quantity_available: 500,
    minimum_order_quantity: 10,
    notes: "Pain reliever and fever reducer",
  },
  {
    medicine_name: "Ibuprofen",
    unit_price: 8.75,
    quantity_available: 300,
    minimum_order_quantity: 10,
    notes: "Anti-inflammatory medication",
  },
  {
    medicine_name: "Amoxicillin",
    unit_price: 15.0,
    quantity_available: 200,
    minimum_order_quantity: 5,
    notes: "Antibiotic for bacterial infections",
  },
  {
    medicine_name: "Ciprofloxacin",
    unit_price: 25.0,
    quantity_available: 150,
    minimum_order_quantity: 5,
    notes: "Broad-spectrum antibiotic",
  },
  {
    medicine_name: "Metformin",
    unit_price: 12.5,
    quantity_available: 400,
    minimum_order_quantity: 10,
    notes: "Diabetes medication",
  },
  {
    medicine_name: "Amlodipine",
    unit_price: 20.0,
    quantity_available: 250,
    minimum_order_quantity: 10,
    notes: "Blood pressure medication",
  },
  {
    medicine_name: "Omeprazole",
    unit_price: 18.0,
    quantity_available: 300,
    minimum_order_quantity: 10,
    notes: "Proton pump inhibitor for acid reflux",
  },
  {
    medicine_name: "Atorvastatin",
    unit_price: 30.0,
    quantity_available: 200,
    minimum_order_quantity: 5,
    notes: "Cholesterol-lowering medication",
  },
  {
    medicine_name: "Losartan",
    unit_price: 22.0,
    quantity_available: 180,
    minimum_order_quantity: 10,
    notes: "Blood pressure medication (ARB)",
  },
  {
    medicine_name: "Aspirin",
    unit_price: 3.5,
    quantity_available: 600,
    minimum_order_quantity: 20,
    notes: "Pain reliever and blood thinner",
  },
  {
    medicine_name: "Cetirizine",
    unit_price: 6.0,
    quantity_available: 350,
    minimum_order_quantity: 10,
    notes: "Antihistamine for allergies",
  },
  {
    medicine_name: "Diclofenac",
    unit_price: 10.0,
    quantity_available: 250,
    minimum_order_quantity: 10,
    notes: "NSAID for pain and inflammation",
  },
  {
    medicine_name: "Ranitidine",
    unit_price: 8.5,
    quantity_available: 280,
    minimum_order_quantity: 10,
    notes: "H2 blocker for stomach acid",
  },
  {
    medicine_name: "Salbutamol",
    unit_price: 35.0,
    quantity_available: 100,
    minimum_order_quantity: 5,
    notes: "Bronchodilator for asthma",
  },
  {
    medicine_name: "Insulin",
    unit_price: 150.0,
    quantity_available: 50,
    minimum_order_quantity: 2,
    notes: "Diabetes treatment - refrigerate",
  },
  {
    medicine_name: "Azithromycin",
    unit_price: 28.0,
    quantity_available: 120,
    minimum_order_quantity: 5,
    notes: "Macrolide antibiotic",
  },
  {
    medicine_name: "Doxycycline",
    unit_price: 18.0,
    quantity_available: 150,
    minimum_order_quantity: 5,
    notes: "Tetracycline antibiotic",
  },
  {
    medicine_name: "Prednisolone",
    unit_price: 12.0,
    quantity_available: 200,
    minimum_order_quantity: 10,
    notes: "Corticosteroid for inflammation",
  },
  {
    medicine_name: "Furosemide",
    unit_price: 7.5,
    quantity_available: 300,
    minimum_order_quantity: 10,
    notes: "Diuretic for fluid retention",
  },
  {
    medicine_name: "Warfarin",
    unit_price: 15.0,
    quantity_available: 100,
    minimum_order_quantity: 5,
    notes: "Anticoagulant - requires monitoring",
  },
];

// Create workbook
const wb = xlsx.utils.book_new();

// Create worksheet from data
const ws = xlsx.utils.json_to_sheet(drugData);

// Set column widths
ws["!cols"] = [
  { wch: 20 }, // medicine_name
  { wch: 12 }, // unit_price
  { wch: 18 }, // quantity_available
  { wch: 22 }, // minimum_order_quantity
  { wch: 40 }, // notes
];

// Add worksheet to workbook
xlsx.utils.book_append_sheet(wb, ws, "Catalog");

// Write to file
const outputPath = path.join(__dirname, "..", "supplier_catalog_template.xlsx");
xlsx.writeFile(wb, outputPath);

console.log("✓ Excel file created successfully!");
console.log(`  Location: ${outputPath}`);
console.log(`  Total drugs: ${drugData.length}`);
console.log("\nFile contains the following columns:");
console.log("  - medicine_name: Name of the medicine");
console.log("  - unit_price: Price per unit in ETB");
console.log("  - quantity_available: Available quantity");
console.log("  - minimum_order_quantity: Minimum order quantity");
console.log("  - notes: Additional information");
console.log("\nYou can upload this file in the Supplier Catalog page.");
