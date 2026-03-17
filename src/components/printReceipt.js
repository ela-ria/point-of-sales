// printReceipt.js
// Prints an 80mm thermal receipt via a hidden iframe.
// Usage: printReceipt(txn)
// txn shape matches the transaction object built in App.js handlePayment()

export function printReceipt(txn) {
  if (!txn) return;

  var formatPHP = function(amount) {
    return "PHP " + Number(amount).toFixed(2);
  };

  var itemRows = txn.items.map(function(item) {
    return (
      "<tr>" +
        "<td style='padding:1px 0;'>" + item.name + "</td>" +
        "<td style='text-align:center;padding:1px 4px;'>" + item.qty + "</td>" +
        "<td style='text-align:right;padding:1px 0;'>" + formatPHP(item.price) + "</td>" +
        "<td style='text-align:right;padding:1px 0;'>" + formatPHP(item.price * item.qty) + "</td>" +
      "</tr>"
    );
  }).join("");

  var discountRow = txn.discount
    ? "<tr>" +
        "<td colspan='3' style='padding-top:4px;'>" + txn.discount.label + " (" + (txn.discount.rate * 100).toFixed(0) + "%)</td>" +
        "<td style='text-align:right;padding-top:4px;'>-" + formatPHP(txn.discountAmount) + "</td>" +
      "</tr>"
    : "";

  var reprintBanner = txn.reprinted
    ? "<div style='text-align:center;font-size:11px;border:1px dashed #000;padding:2px;margin-bottom:6px;letter-spacing:2px;'>*** REPRINT ***</div>"
    : "";

  var html =
    "<!DOCTYPE html>" +
    "<html><head><meta charset='utf-8'>" +
    "<title>Receipt " + txn.receiptNo + "</title>" +
    "<style>" +
      "@page { size: 80mm auto; margin: 4mm; }" +
      "* { box-sizing: border-box; }" +
      "body { font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #000; width: 72mm; margin: 0 auto; }" +
      "h1 { font-size: 15px; text-align: center; margin: 0 0 2px; letter-spacing: 2px; }" +
      "p  { margin: 1px 0; font-size: 11px; text-align: center; }" +
      ".divider { border: none; border-top: 1px dashed #000; margin: 6px 0; }" +
      "table { width: 100%; border-collapse: collapse; font-size: 11px; }" +
      "th { text-align: left; font-size: 10px; border-bottom: 1px solid #000; padding-bottom: 2px; }" +
      "th:nth-child(2) { text-align:center; }" +
      "th:nth-child(3), th:nth-child(4) { text-align:right; }" +
      ".totals td { font-size: 11px; padding: 1px 0; }" +
      ".totals td:last-child { text-align: right; }" +
      ".grand td { font-size: 13px; font-weight: bold; border-top: 1px solid #000; padding-top: 4px; }" +
      ".grand td:last-child { text-align: right; }" +
      ".footer { text-align: center; font-size: 10px; margin-top: 8px; }" +
    "</style>" +
    "</head><body>" +

    reprintBanner +

    "<h1>MY STORE</h1>" +
    "<p>123 Main Street, City</p>" +
    "<p>Tel: (02) 000-0000</p>" +
    "<p>VAT Reg TIN: 000-000-000-000</p>" +

    "<hr class='divider'>" +

    "<p style='text-align:left;font-size:11px;'>" +
      "Receipt #: <b>" + txn.receiptNo + "</b><br>" +
      "Cashier : " + txn.cashier + "<br>" +
      "Date    : " + txn.time +
    "</p>" +

    "<hr class='divider'>" +

    "<table>" +
      "<thead><tr>" +
        "<th>Item</th>" +
        "<th>Qty</th>" +
        "<th>Price</th>" +
        "<th>Total</th>" +
      "</tr></thead>" +
      "<tbody>" + itemRows + "</tbody>" +
    "</table>" +

    "<hr class='divider'>" +

    "<table class='totals'><tbody>" +
      "<tr><td>Subtotal</td><td>" + formatPHP(txn.subtotal) + "</td></tr>" +
      discountRow +
      "</tbody></table>" +

    "<table><tbody class='grand'>" +
      "<tr class='grand'><td>TOTAL</td><td>" + formatPHP(txn.total) + "</td></tr>" +
    "</tbody></table>" +

    "<table class='totals' style='margin-top:4px;'><tbody>" +
      "<tr><td>Cash Tendered</td><td style='text-align:right;'>" + formatPHP(txn.cash) + "</td></tr>" +
      "<tr><td>Change</td><td style='text-align:right;'>" + formatPHP(txn.change) + "</td></tr>" +
    "</tbody></table>" +

    "<hr class='divider'>" +

    "<div class='footer'>" +
      "<p>Items sold: " + txn.items.reduce(function(s,i){ return s + i.qty; }, 0) + "</p>" +
      "<p style='margin-top:6px;'>Thank you for shopping with us!</p>" +
      "<p>Please come again.</p>" +
    "</div>" +

    "</body></html>";

  // ── inject into a hidden iframe and print ──────────────────────────────────
  var iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:80mm;height:0;border:none;";
  document.body.appendChild(iframe);

  var doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  iframe.contentWindow.focus();
  iframe.contentWindow.onafterprint = function() {
    document.body.removeChild(iframe);
  };

  // small delay lets the iframe fully render before the print dialog opens
  setTimeout(function() {
    iframe.contentWindow.print();
  }, 350);
}