const paymentMehotdTypes = {
  CASH: "Cash",
  CHEQUE: "Cheque",
  CREDIT: "Credit",
  BANKTRANSFER: "Bank Transfer",
};

const paymentStatus = {
  PENDONG: "Pending",
  PARTIAL_PAYMENT: "Partial payment",
  COMPLETED: "Completed",
};

module.exports = { paymentMehotdTypes, paymentStatus };
