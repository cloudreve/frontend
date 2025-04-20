import { Box, Button, Popover, PopoverProps, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DenseFilledTextField } from "../../Common/StyledComponents";
import SettingForm from "../../Pages/Setting/SettingForm";
import SinglePolicySelectionInput from "../Common/SinglePolicySelectionInput";

export interface FileFilterPopoverProps extends PopoverProps {
  storagePolicy: string;
  setStoragePolicy: (storagePolicy: string) => void;
  owner: string;
  setOwner: (owner: string) => void;
  name: string;
  setName: (name: string) => void;
  clearFilters: () => void;
}

const FileFilterPopover = ({
  storagePolicy,
  setStoragePolicy,
  owner,
  setOwner,
  name,
  setName,
  clearFilters,
  onClose,
  open,
  ...rest
}: FileFilterPopoverProps) => {
  const { t } = useTranslation("dashboard");

  // Create local state to track changes before applying
  const [localStoragePolicy, setLocalStoragePolicy] = useState(storagePolicy);
  const [localOwner, setLocalOwner] = useState(owner);
  const [localName, setLocalName] = useState(name);

  // Initialize local state when popup opens
  useEffect(() => {
    if (open) {
      setLocalStoragePolicy(storagePolicy);
      setLocalOwner(owner);
      setLocalName(name);
    }
  }, [open]);

  // Apply filters and close popover
  const handleApplyFilters = () => {
    setStoragePolicy(localStoragePolicy);
    setOwner(localOwner);
    setName(localName);
    onClose?.({}, "backdropClick");
  };

  // Reset filters and close popover
  const handleResetFilters = () => {
    setLocalStoragePolicy("");
    setLocalOwner("");
    setLocalName("");
    clearFilters();
    onClose?.({}, "backdropClick");
  };

  return (
    <Popover
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      slotProps={{
        paper: {
          sx: {
            p: 2,
            width: 300,
            maxWidth: "100%",
          },
        },
      }}
      onClose={onClose}
      open={open}
      {...rest}
    >
      <Stack spacing={2}>
        <SettingForm title={t("file.uploaderID")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localOwner}
            onChange={(e) => setLocalOwner(e.target.value)}
            placeholder={t("user.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <SettingForm title={t("file.searchFileName")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            placeholder={t("user.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <SettingForm title={t("file.storagePolicy")} noContainer lgWidth={12}>
          <SinglePolicySelectionInput
            value={localStoragePolicy == "" ? -1 : parseInt(localStoragePolicy)}
            onChange={(value) => setLocalStoragePolicy(value.toString())}
            emptyValue={-1}
            emptyText={t("user.all")}
          />
        </SettingForm>

        <Box display="flex" justifyContent="space-between">
          <Button variant="outlined" size="small" onClick={handleResetFilters}>
            {t("user.reset")}
          </Button>
          <Button variant="contained" size="small" onClick={handleApplyFilters}>
            {t("user.apply")}
          </Button>
        </Box>
      </Stack>
    </Popover>
  );
};

export default FileFilterPopover;
