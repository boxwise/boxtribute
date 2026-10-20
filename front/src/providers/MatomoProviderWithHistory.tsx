import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MatomoProvider, useMatomo } from "matomo-tracker-for-react";

function MatomoReferrerPrivacy({ children }: { children: React.ReactNode }) {
  const { pushInstruction } = useMatomo();

  useEffect(() => {
    // Matomo otherwise collects document.referrer, which may contain sensitive query parameters.
    pushInstruction(["setReferrerUrl", ""]);
  }, [pushInstruction]);

  return children;
}

function MatomoProviderWithHistory({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <MatomoProvider
      urlBase="https://boxtribute.matomo.cloud"
      siteId={2}
      path={location.pathname}
      linkTracking={false}
      disabled={import.meta.env.MODE === "test" || import.meta.env.DEV}
    >
      <MatomoReferrerPrivacy>{children}</MatomoReferrerPrivacy>
    </MatomoProvider>
  );
}

export default MatomoProviderWithHistory;
