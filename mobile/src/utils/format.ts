/**
 * Formats a numeric or decimal string value into Indian Rupee format with Indian number grouping
 * e.g., "150000.00" -> "₹1,50,000.00"
 */
export const formatINR = (amount: string | number): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0.00";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Formats an ISO date string (YYYY-MM-DD) into readable format (e.g., "15 Nov 2026")
 */
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};
