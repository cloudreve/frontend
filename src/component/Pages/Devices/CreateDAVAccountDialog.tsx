import { useTranslation } from "react-i18next";
import {
  Checkbox,
  DialogContent,
  DialogProps,
  FormGroup,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useAppDispatch } from "../../../redux/hooks.ts";
import DraggableDialog from "../../Dialogs/DraggableDialog.tsx";
import { useSnackbar } from "notistack";
import { useEffect, useMemo, useState } from "react";
import { PathSelectorForm } from "../../Common/Form/PathSelectorForm.tsx";
import { defaultPath } from "../../../hooks/useNavigation.tsx";
import { Filesystem } from "../../../util/uri.ts";
import { OutlineIconTextField } from "../../Common/Form/OutlineIconTextField.tsx";
import Tag from "../../Icons/Tag.tsx";
import DialogAccordion from "../../Dialogs/DialogAccordion.tsx";
import Boolset from "../../../util/boolset.ts";
import { GroupPermission } from "../../../api/user.ts";
import SessionManager from "../../../session";
import { SmallFormControlLabel } from "../../Common/StyledComponents.tsx";
import {
  sendCreateDavAccounts,
  sendUpdateDavAccounts,
} from "../../../api/api.ts";
import { DavAccount, DavAccountOption } from "../../../api/setting.ts";

export interface CreateDAVAccountDialogProps extends DialogProps {
  onAccountAdded?: (account: DavAccount) => void;
  onAccountUpdated?: (account: DavAccount) => void;
  editTarget?: DavAccount;
}

const CreateDAVAccountDialog = ({
  onClose,
  onAccountAdded,
  onAccountUpdated,
  editTarget,
  open,
  ...rest
}: CreateDAVAccountDialogProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [path, setPath] = useState(defaultPath);
  const [readonly, setReadonly] = useState(false);
  const [proxy, setProxy] = useState(false);

  const theme = useTheme();

  const groupProxyEnabled = useMemo(() => {
    const perm = new Boolset(
      SessionManager.currentLoginOrNull()?.user.group?.permission,
    );
    return perm.enabled(GroupPermission.webdav_proxy);
  }, []);

  useEffect(() => {
    if (open && editTarget) {
      setName(editTarget.name);
      setPath(editTarget.uri);
      const options = new Boolset(editTarget.options);
      setReadonly(options.enabled(DavAccountOption.readonly));
      setProxy(options.enabled(DavAccountOption.proxy));
    }
  }, [open]);

  const onAccept = () => {
    if (!name || !path) {
      return;
    }

    setLoading(true);
    const req = {
      name,
      uri: path,
      proxy,
      readonly,
    };
    dispatch(
      editTarget
        ? sendUpdateDavAccounts(editTarget.id, req)
        : sendCreateDavAccounts(req),
    )
      .then((account) => {
        onClose && onClose({}, "escapeKeyDown");
        !editTarget && onAccountAdded && onAccountAdded(account);
        editTarget && onAccountUpdated && onAccountUpdated(account);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <DraggableDialog
      title={
        editTarget
          ? t("setting.editWebDavAccount", {
              name: editTarget.name,
            })
          : t("setting.createWebDavAccount")
      }
      showActions
      loading={loading}
      showCancel
      onAccept={onAccept}
      disabled={!name || !path}
      dialogProps={{
        onClose: onClose,
        open: open,
        fullWidth: true,
        maxWidth: "xs",
        disableRestoreFocus: true,
        ...rest,
      }}
    >
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2} direction={"column"}>
          <OutlineIconTextField
            icon={<Tag />}
            variant="outlined"
            value={name}
            multiline
            onChange={(e) => setName(e.target.value)}
            label={t("setting.annotation")}
            fullWidth
          />
          <PathSelectorForm
            onChange={setPath}
            path={path}
            variant={"davAccountRoot"}
            label={t("application:setting.rootFolder")}
            allowedFs={[Filesystem.my, Filesystem.share]}
          />
          <DialogAccordion
            accordionDetailProps={{ sx: { pt: 0, pl: "30px" } }}
            defaultExpanded={readonly || (groupProxyEnabled && proxy)}
            title={t("application:modals.advanceOptions")}
          >
            <FormGroup>
              <SmallFormControlLabel
                control={
                  <Checkbox
                    size="small"
                    onChange={(e) => setReadonly(e.target.checked)}
                    checked={readonly}
                  />
                }
                label={t("application:setting.readonlyOn")}
              />
              <Typography
                sx={{ pl: "27px" }}
                variant={"caption"}
                color={"text.secondary"}
              >
                {t("application:setting.readonlyTooltip")}
              </Typography>
              {groupProxyEnabled && (
                <>
                  <SmallFormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        onChange={(e) => setProxy(e.target.checked)}
                        checked={proxy}
                      />
                    }
                    label={t("application:setting.proxy")}
                  />
                  <Typography
                    sx={{ pl: "27px" }}
                    variant={"caption"}
                    color={"text.secondary"}
                  >
                    {t("application:setting.proxyTooltip")}
                  </Typography>
                </>
              )}
            </FormGroup>
          </DialogAccordion>
        </Stack>
      </DialogContent>
    </DraggableDialog>
  );
};
export default CreateDAVAccountDialog;
