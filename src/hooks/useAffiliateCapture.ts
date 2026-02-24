import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { saveAffiliateRef, getAffiliateRef } from "@/lib/affiliate";

/**
 * Hook to capture affiliate referral codes from URL params (?ref=CODE)
 * and persist them in localStorage for 30 days.
 */
export const useAffiliateCapture = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && ref.trim()) {
      saveAffiliateRef(ref.trim().toUpperCase());
    }
  }, [searchParams]);

  return getAffiliateRef();
};
