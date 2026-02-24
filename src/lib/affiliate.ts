const AFFILIATE_STORAGE_KEY = "safari_affiliate_ref";
const AFFILIATE_EXPIRY_KEY = "safari_affiliate_ref_expiry";
const CACHE_DAYS = 30;

export const saveAffiliateRef = (code: string) => {
  try {
    localStorage.setItem(AFFILIATE_STORAGE_KEY, code);
    const expiry = Date.now() + CACHE_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(AFFILIATE_EXPIRY_KEY, String(expiry));
  } catch {}
};

export const getAffiliateRef = (): string | null => {
  try {
    const expiry = localStorage.getItem(AFFILIATE_EXPIRY_KEY);
    if (expiry && Date.now() > Number(expiry)) {
      localStorage.removeItem(AFFILIATE_STORAGE_KEY);
      localStorage.removeItem(AFFILIATE_EXPIRY_KEY);
      return null;
    }
    return localStorage.getItem(AFFILIATE_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const clearAffiliateRef = () => {
  try {
    localStorage.removeItem(AFFILIATE_STORAGE_KEY);
    localStorage.removeItem(AFFILIATE_EXPIRY_KEY);
  } catch {}
};

export const generateReferralCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "SH-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};
