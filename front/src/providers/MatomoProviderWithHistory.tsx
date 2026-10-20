import { useLocation } from "react-router-dom";
import { MatomoProvider } from "matomo-tracker-for-react";

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
      {children}
    </MatomoProvider>
  );
}

export default MatomoProviderWithHistory;
