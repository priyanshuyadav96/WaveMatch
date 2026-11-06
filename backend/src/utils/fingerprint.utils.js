function encodeFingerprint(bin1, bin2, timeDelta) {
  if (
    !Number.isInteger(bin1) || bin1 < 0 || bin1 > 511 ||
    !Number.isInteger(bin2) || bin2 < 0 || bin2 > 511 ||
    !Number.isInteger(timeDelta) || timeDelta < 0 || timeDelta > 31
  ) {
    throw new Error("Fingerprint values are out of range");
  }

  return (
    (bin1 << 14) |
    (bin2 << 5) |
    timeDelta
  ) >>> 0;
}


module.exports = {
  encodeFingerprint
};