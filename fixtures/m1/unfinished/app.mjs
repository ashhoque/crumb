export function totalOutstanding(invoices) {
  return invoices.filter(invoice => !invoice.paid).reduce((sum, invoice) => sum + invoice.amount, 0);
}
