import { useTranslation } from "react-i18next";
import { DialogContent, FormControlLabel, TextField } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import { useCallback, useMemo, useState } from "react";
import DraggableDialog from "../../Dialogs/DraggableDialog.tsx";
import { closeDirectLinkDialog } from "../../../redux/globalStateSlice.ts";
import CrUri from "../../../util/uri.ts";
import { StyledCheckbox } from "../../Common/StyledComponents.tsx";

const DirectLinks = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [showFileName, setShowFileName] = useState(false);

  const open = useAppSelector((state) => state.globalState.directLinkDialogOpen);
  const targets = useAppSelector((state) => state.globalState.directLinkRes);

  const contents = useMemo(() => {
    if (!targets) {
      return "";
    }

    return targets
      .map((link) => {
        if (!showFileName) {
          return link.link;
        }

        const crUri = new CrUri(link.file_url);
        const elements = crUri.elements();
        return `[${elements.pop()}] ${link.link}`;
      })
      .join("\n");
  }, [targets, showFileName]);

  const onClose = useCallback(() => {
    dispatch(closeDirectLinkDialog());
  }, [dispatch]);

  return (
    <DraggableDialog
      title={t("application:modals.getSourceLinkTitle")}
      showActions
      hideOk
      secondaryAction={
        <FormControlLabel
          sx={{
            ml: 0,
          }}
          slotProps={{
            typography: {
              variant: "body2",
              pl: 1,
              color: "text.secondary",
            },
          }}
          control={
            <StyledCheckbox
              onChange={() => {
                setShowFileName(!showFileName);
              }}
              disableRipple
              checked={showFileName}
              size="small"
            />
          }
          label={t("application:modals.showFileName")}
        />
      }
      dialogProps={{
        open: open ?? false,
        onClose: onClose,
        fullWidth: true,
        maxWidth: "sm",
      }}
    >
      <DialogContent sx={{ pt: 2, pb: 0 }}>
        <TextField
          autoFocus
          label={t("modals.sourceLink")}
          multiline
          value={contents}
          variant="outlined"
          fullWidth
          slotProps={{
            htmlInput: { readonly: true },
          }}
        />
      </DialogContent>
    </DraggableDialog>
  );
};
export default DirectLinks;
