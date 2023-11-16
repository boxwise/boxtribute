import { IQrResolvedValue, IQrResolverResultKind, useQrResolver } from "hooks/useQrResolver";
import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { BoxViewSkeleton } from "components/Skeletons";
import QrReaderView from "../QrReaderView";

function ResolveHash() {
  const navigate = useNavigate();
  const { resolveQrHash } = useQrResolver();
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const baseId = globalPreferences.selectedBase?.id!;
  const [resolvedValue, setResolvedValue] = useState<IQrResolvedValue | undefined>(undefined);

  const hash = useParams<{ hash: string }>().hash!;

  useEffect(() => {
    resolveQrHash(hash, "network-only")
      .then((value) => {
        setResolvedValue(value);
      })
      .catch(() => {
        setResolvedValue({
          kind: IQrResolverResultKind.FAIL,
          qrHash: hash,
        } as IQrResolvedValue);
      });
  }, [hash, resolveQrHash]);

  if (!resolvedValue) {
    return <BoxViewSkeleton data-testid="loader" />;
  }

  switch (resolvedValue.kind) {
    case IQrResolverResultKind.SUCCESS: {
      const boxLabelIdentifier = resolvedValue.box.labelIdentifier;
      const boxBaseId = resolvedValue.box.location.base.id;
      navigate(`/bases/${boxBaseId}/boxes/${boxLabelIdentifier}`);
      break;
    }
    case IQrResolverResultKind.NOT_ASSIGNED_TO_BOX: {
      navigate(`/bases/${baseId}/boxes/create/${resolvedValue.qrHash}`);

      break;
    }
    default: {
      break;
    }
  }
  return <QrReaderView />;
}

export default ResolveHash;
