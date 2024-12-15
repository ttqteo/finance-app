import { Button } from "@/components/ui/button";
import { UploadIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCSVReader } from "react-papaparse";

type Props = {
  onUpload: (result: any) => void;
};

const UploadButton = ({ onUpload }: Props) => {
  const t = useTranslations();
  const { CSVReader } = useCSVReader();
  // TODO: Add a paywall
  return (
    <CSVReader onUploadAccepted={onUpload}>
      {({ getRootProps }: any) => (
        <Button size="sm" className="w-full lg:w-auto" {...getRootProps()}>
          <UploadIcon className="size-4 mr-2" />
          {t("Common.Action.Import")}
        </Button>
      )}
    </CSVReader>
  );
};

export default UploadButton;
