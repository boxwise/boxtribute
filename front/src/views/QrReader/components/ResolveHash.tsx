import { IQrResolverResultKind, useQrResolver } from "hooks/useQrResolver";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { BoxViewSkeleton } from "components/Skeletons";
import QrReaderView from "../QrReaderView";
import { useBaseIdParam } from "hooks/useBaseIdParam";

function ResolveHash() {
  const navigate = useNavigate();
  const { resolveQrHash } = useQrResolver();
  const { baseId } = useBaseIdParam();
  const [showQrScanner, setShowQrScanner] = useState<boolean>(false);

  const hash = useParams<{ hash: string }>().hash!;

  useEffect(() => {
    resolveQrHash(hash, "network-only")
      .then((value) => {
        switch (value.kind) {
          case IQrResolverResultKind.SUCCESS: {
            const boxLabelIdentifier = value.box.labelIdentifier;
            const boxBaseId = value.box.location.base.id;
            navigate(`/bases/${boxBaseId}/boxes/${boxLabelIdentifier}`);
            break;
          }
          case IQrResolverResultKind.NOT_ASSIGNED_TO_BOX: {
            navigate(`/bases/${baseId}/boxes/create/${value.qrHash}`);

            break;
          }
          default: {
            setShowQrScanner(true);

            break;
          }
        }
      })
      .catch(() => {
        setShowQrScanner(true);
      });
  }, [baseId, hash, navigate, resolveQrHash]);

  if (!showQrScanner) {
    return <BoxViewSkeleton />;
  }

  return <QrReaderView />;
}

export default ResolveHash;
