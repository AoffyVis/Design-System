export function generatePrint(): string {
  const lines: string[] = [];

  lines.push(`@media print {`);
  lines.push(`  .no-print {`);
  lines.push(`    display: none !important;`);
  lines.push(`  }`);
  lines.push(``);
  lines.push(`  .print-bg {`);
  lines.push(`    -webkit-print-color-adjust: exact;`);
  lines.push(`    print-color-adjust: exact;`);
  lines.push(`  }`);
  lines.push(`}`);

  return lines.join('\n');
}
