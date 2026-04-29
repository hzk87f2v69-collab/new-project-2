document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const storedSelection = getPurchaseSelection();
  const selection = normalizePurchaseSelection({
    type: params.get("type") || storedSelection?.type,
    planName: params.get("plan") || storedSelection?.planName || "Ace Fitness Program",
    amount: params.get("amount") || storedSelection?.amount || 0,
    bundleId: params.get("bundle") || storedSelection?.bundleId,
    trackIds: (params.get("tracks") || storedSelection?.trackIds?.join(",") || "")
      .split(",")
      .filter(Boolean),
    paymentMethod: params.get("payment") || storedSelection?.paymentMethod || "upi"
  });

  const planNode = document.getElementById("successPlan");
  const amountNode = document.getElementById("successAmount");
  const tracksNode = document.getElementById("successTracks");
  const paymentNode = document.getElementById("successPaymentMethod");
  const whatsappNode = document.getElementById("successWhatsapp");
  const emailNode = document.getElementById("successEmail");
  const copyEmailButton = document.getElementById("copySupportEmail");
  const copyStatus = document.getElementById("successCopyStatus");

  await fetchTracks().catch(() => null);

  if (planNode) planNode.textContent = selection?.planName || "Ace Fitness Program";
  if (amountNode) amountNode.textContent = selection?.amount ? currency(selection.amount) : "Custom amount";
  if (tracksNode) tracksNode.textContent = selection ? formatTrackNames(selection.trackIds, "Selected programs") : "Selected programs";
  if (paymentNode) paymentNode.textContent = selection?.paymentMethod === "razorpay" ? "Razorpay" : "UPI / QR";
  if (whatsappNode) whatsappNode.textContent = ACE_PAYMENT_CONFIG.whatsappNumber;
  if (emailNode) emailNode.textContent = ACE_PAYMENT_CONFIG.email;

  if (copyEmailButton) {
    copyEmailButton.addEventListener("click", async () => {
      const copied = await copyToClipboard(ACE_PAYMENT_CONFIG.email);
      setStatus(
        copyStatus,
        copied ? "Email copied. Send your payment screenshot or UTR there too." : "Could not copy the email. Please copy it manually.",
        copied ? "success" : "error"
      );
    });
  }

  if (selection?.paymentMethod === "upi") {
    clearPurchaseSelection();
  }
});
