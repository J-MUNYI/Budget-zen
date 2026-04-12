function toPublicUser(user) {
  if (!user) return null;
  const o = user.toObject ? user.toObject() : user;
  return {
    id: String(o._id || o.id),
    name: o.name,
    email: o.email,
    monthlyIncome: o.monthlyIncome === undefined || o.monthlyIncome === null ? null : Number(o.monthlyIncome),
    mpesaBalance: o.mpesaBalance != null ? Number(o.mpesaBalance) : 0,
    mpesaPhoneLast4: o.mpesaPhoneLast4 || "",
    insightsFocus: o.insightsFocus || "",
  };
}

module.exports = { toPublicUser };
