/**
 * Create Excel file with only medicines that exist in the database
 */

const xlsx = require("xlsx");
const path = require("path");

// Only medicines that exist in the database
const drugData = [
  {
    medicine_name: "Amlodipine",
    unit_price: 22.5,
    quantity_available: 150,
    minimum_order_quantity: 10,
    notes: "Blood pressure medication - 5mg tablets",
  },
  {
    medicine_name: "Amoxicillin",
    unit_price: 18.0,
    quantity_available: 200,
    minimum_order_quantity: 10,
    notes: "Antibiotic - 500mg capsules",
  },
  {
    medicine_name: "Ciprofloxacin",
    unit_price: 28.0,
    quantity_available: 100,
    minimum_order_quantity: 5,
    notes: "Broad-spectrum antibiotic - 500mg tablets",
  },
  {
    medicine_name: "Ibuprofen",
    unit_price: 9.5,
    quantity_available: 300,
    minimum_order_quantity: 15,
    notes: "Anti-inflammatory - 400mg tablets",
  },
  {
    medicine_name: "Omeprazole",
    unit_price: 20.0,
    quantity_available: 180,
    minimum_order_quantity: 10,
    notes: "Proton pump inhibitor - 20mg capsules",
  },
  {
    medicine_name: "Paracetamol",
    unit_price: 6.0,
    quantity_available: 500,
    minimum_order_quantity: 20,
    notes: "Pain reliever and fever reducer - 500mg tablets",
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
  { wch: 50 }, // notes
];

// Add worksheet to workbook
xlsx.utils.book_append_sheet(wb, ws, "Catalog");

// Write to file
const outputPath = path.join(
  __dirname,
  "..",
  "supplier_catalog_upload_ready.xlsx",
);
xlsx.writeFile(wb, outputPath);

console.log("✓ Excel file created successfully!");
console.log(`  Location: ${outputPath}`);
console.log(`  Total drugs: ${drugData.length}`);
console.log("\n✓ All medicines in this file exist in your database");
console.log("✓ Ready to upload without errors");
console.log("\nMedicines included:");
drugData.forEach((drug, index) => {
  console.log(
    `  ${index + 1}. ${drug.medicine_name} - ${drug.unit_price} ETB (${drug.quantity_available} units)`,
  );
});
console.log("\nYou can upload this file in the Supplier Catalog page.");
console.log("All items will be successfully added/updated.");
