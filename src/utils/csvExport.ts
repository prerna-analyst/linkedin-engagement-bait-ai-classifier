import { PriceAlert, WishlistItem } from '../types/index.ts';

/**
 * Escapes a cell value for standard CSV compatibility.
 * Handles commas, double-quotes, newlines, and null/undefined.
 */
function escapeCSV(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Triggers browser download of a CSV file with UTF-8 BOM for Excel/Sheets compatibility.
 */
function downloadCSV(csvContent: string, fileName: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports both Price Alerts and Wishlist items combined into a single CSV.
 */
export function exportCombinedCSV(alerts: PriceAlert[], wishlist: WishlistItem[], userName?: string) {
  const headers = [
    'Record Type',
    'Product Name',
    'Brand',
    'Category',
    'Target Price (INR)',
    'Current Lowest Price (INR)',
    'Original MRP (INR)',
    'Potential Savings (INR)',
    'Best Store',
    'Tracking Status',
    'Target Met',
    'Date Added / Created',
    'Product URL',
  ];

  const rows: string[][] = [];

  // 1. Process Price Alerts
  alerts.forEach((alert) => {
    const product = alert.product;
    const currentPrice = product?.lowestPrice || alert.currentPriceAtCreation || 0;
    const originalPrice = product?.listings?.[0]?.originalPrice || currentPrice;
    const savings = Math.max(0, currentPrice - alert.targetPrice);
    const isTargetMet = alert.isTriggered || currentPrice <= alert.targetPrice;

    rows.push([
      'Price Alert',
      product?.name || 'Unknown Product',
      product?.brand || 'N/A',
      product?.category || 'N/A',
      `₹${alert.targetPrice.toLocaleString('en-IN')}`,
      `₹${currentPrice.toLocaleString('en-IN')}`,
      `₹${originalPrice.toLocaleString('en-IN')}`,
      `₹${savings.toLocaleString('en-IN')}`,
      product?.cheapestStore || 'N/A',
      alert.isActive ? 'Active Monitoring' : 'Paused',
      isTargetMet ? 'YES (Target Met)' : 'NO (Monitoring)',
      new Date(alert.createdAt).toLocaleDateString('en-IN'),
      `${window.location.origin}/products/${alert.productId}`,
    ]);
  });

  // 2. Process Wishlist
  wishlist.forEach((item) => {
    const product = item.product;
    const currentPrice = product?.lowestPrice || 0;
    const originalPrice = product?.listings?.[0]?.originalPrice || currentPrice;
    const savings = Math.max(0, originalPrice - currentPrice);

    rows.push([
      'Wishlist Item',
      product?.name || 'Unknown Product',
      product?.brand || 'N/A',
      product?.category || 'N/A',
      item.targetPrice ? `₹${item.targetPrice.toLocaleString('en-IN')}` : 'N/A',
      `₹${currentPrice.toLocaleString('en-IN')}`,
      `₹${originalPrice.toLocaleString('en-IN')}`,
      `₹${savings.toLocaleString('en-IN')}`,
      product?.cheapestStore || 'N/A',
      'Saved in Wishlist',
      item.targetPrice && currentPrice <= item.targetPrice ? 'YES' : 'N/A',
      new Date(item.addedAt).toLocaleDateString('en-IN'),
      `${window.location.origin}/products/${item.productId}`,
    ]);
  });

  const csvString = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\r\n');

  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `PriceTrack_Tracking_Data_${dateStr}.csv`;
  downloadCSV(csvString, filename);
}

/**
 * Exports only Price Alerts as a dedicated CSV.
 */
export function exportAlertsCSV(alerts: PriceAlert[]) {
  const headers = [
    'Alert ID',
    'Product Name',
    'Brand',
    'Category',
    'Target Price (INR)',
    'Current Lowest Price (INR)',
    'Price at Creation (INR)',
    'Difference vs Target (INR)',
    'Best Store',
    'Alert Status',
    'Target Met',
    'Created Date',
    'Triggered Date',
  ];

  const rows = alerts.map((alert) => {
    const product = alert.product;
    const currentPrice = product?.lowestPrice || alert.currentPriceAtCreation || 0;
    const diff = currentPrice - alert.targetPrice;
    const isTargetMet = alert.isTriggered || currentPrice <= alert.targetPrice;

    return [
      alert.id,
      product?.name || 'Unknown Product',
      product?.brand || 'N/A',
      product?.category || 'N/A',
      `₹${alert.targetPrice.toLocaleString('en-IN')}`,
      `₹${currentPrice.toLocaleString('en-IN')}`,
      `₹${alert.currentPriceAtCreation.toLocaleString('en-IN')}`,
      diff <= 0 ? `Saved ₹${Math.abs(diff).toLocaleString('en-IN')}` : `₹${diff.toLocaleString('en-IN')} away`,
      product?.cheapestStore || 'N/A',
      alert.isActive ? 'Active' : 'Paused',
      isTargetMet ? 'YES' : 'NO',
      new Date(alert.createdAt).toLocaleString('en-IN'),
      alert.triggeredAt ? new Date(alert.triggeredAt).toLocaleString('en-IN') : 'N/A',
    ];
  });

  const csvString = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\r\n');

  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(csvString, `PriceTrack_Price_Alerts_${dateStr}.csv`);
}

/**
 * Exports only Wishlist items as a dedicated CSV.
 */
export function exportWishlistCSV(wishlist: WishlistItem[]) {
  const headers = [
    'Wishlist ID',
    'Product Name',
    'Brand',
    'Category',
    'Current Lowest Price (INR)',
    'Original MRP (INR)',
    'Discount (%)',
    'Best Store',
    'Target Price (INR)',
    'Added Date',
    'Product Link',
  ];

  const rows = wishlist.map((item) => {
    const product = item.product;
    const currentPrice = product?.lowestPrice || 0;
    const originalPrice = product?.listings?.[0]?.originalPrice || currentPrice;
    const discount = product?.discountPercentage || Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

    return [
      item.id,
      product?.name || 'Unknown Product',
      product?.brand || 'N/A',
      product?.category || 'N/A',
      `₹${currentPrice.toLocaleString('en-IN')}`,
      `₹${originalPrice.toLocaleString('en-IN')}`,
      `${discount}%`,
      product?.cheapestStore || 'N/A',
      item.targetPrice ? `₹${item.targetPrice.toLocaleString('en-IN')}` : 'Not Set',
      new Date(item.addedAt).toLocaleString('en-IN'),
      `${window.location.origin}/products/${item.productId}`,
    ];
  });

  const csvString = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\r\n');

  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(csvString, `PriceTrack_Saved_Wishlist_${dateStr}.csv`);
}
