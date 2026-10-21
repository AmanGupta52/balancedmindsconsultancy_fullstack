const { coupons, defaultSessionFee } = require("../config/env");

const getSessionFee = (expert) =>
  Number.isFinite(expert?.fee) ? expert.fee : defaultSessionFee;

/** Returns { code, percent, fee, total } or throws when the coupon is unknown. */
function priceSession(expert, couponCode) {
  const fee = getSessionFee(expert);
  const code = String(couponCode || "").trim().toUpperCase();
  if (!code) return { code: "", percent: 0, fee, total: fee };

  const percent = coupons[code];
  if (!percent) {
    const err = new Error("Invalid coupon code");
    err.status = 400;
    throw err;
  }
  const total = Math.max(0, Math.round(fee * (1 - percent / 100)));
  return { code, percent, fee, total };
}

module.exports = { getSessionFee, priceSession };
