async function verifyWithIssuer(identityType, checks) {
  const issuerMap = {
    AADHAAR: { issuer: "UIDAI", level: "HIGH" },
    ABHA: { issuer: "ABDM", level: "HIGH" },
    DIGILOCKER: { issuer: "MEITY", level: "MEDIUM" }
  };

  const config = issuerMap[identityType];
  if (!config) {
    return { verified: false };
  }

  // Aadhaar requires OTP + Biometric
  if (identityType === "AADHAAR") {
    if (!checks.otpPassed || !checks.biometricPassed) {
      return { verified: false };
    }
  }

  // ABHA requires login
  if (identityType === "ABHA") {
    if (!checks.otpPassed) {
      return { verified: false };
    }
  }

  // DigiLocker requires SSO
  if (identityType === "DIGILOCKER") {
    if (!checks.otpPassed) {
      return { verified: false };
    }
  }

  return {
    verified: true,
    issuer: config.issuer,
    assuranceLevel: config.level
  };
}

module.exports = { verifyWithIssuer };
