import { LoadingButton } from "@mui/lab";
import { Box, Collapse, Stack, useMediaQuery, useTheme } from "@mui/material";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { sendUpdateUserSetting } from "../../../../api/api.ts";
import { Passkey, UserSettings } from "../../../../api/user.ts";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks.ts";
import SessionManager from "../../../../session";
import { DefaultCloseAction } from "../../../Common/Snackbar/snackbar.tsx";
import { DenseFilledTextField, SecondaryButton, SquareChip } from "../../../Common/StyledComponents.tsx";
import Edit from "../../../Icons/Edit.tsx";
import Open from "../../../Icons/Open.tsx";
import { ProfileSettingProps } from "../ProfileSetting.tsx";
import SettingForm from "../SettingForm.tsx";
import Disable2FADialog from "./Disable2FADialog.tsx";
import Enable2FADialog from "./Enable2FADialog.tsx";
import PasskeyList from "./PasskeyList.tsx";

export interface SecuritySettingProps {
  setting: UserSettings;
  setSetting: (setting: UserSettings) => void;
}

const SecuritySetting = ({ setting, setSetting }: ProfileSettingProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const authEnabled = useAppSelector((s) => s.siteConfig.login.config.authn);

  const resetPwdFormRef = React.createRef<HTMLFormElement>();
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [enable2FAOpen, setEnable2FAOpen] = useState(false);
  const [disable2FAOpen, setDisable2FAOpen] = useState(false);

  const submitResetPassword = () => {
    if (!resetPwdFormRef.current) {
      return;
    }
    if (!resetPwdFormRef.current.checkValidity()) {
      resetPwdFormRef.current.reportValidity();
      return;
    }

    if (newPassword !== repeatPassword) {
      enqueueSnackbar({
        variant: "warning",
        message: t("login.passwordNotMatch"),
        action: DefaultCloseAction,
      });
      return;
    }

    setResetLoading(true);
    dispatch(
      sendUpdateUserSetting({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    )
      .then(() => {
        SessionManager.signOutCurrent();
        navigate("/session");
        setShowResetPassword(false);
        enqueueSnackbar({
          variant: "success",
          message: t("login.passwordReset"),
          action: DefaultCloseAction,
        });
      })
      .finally(() => {
        setResetLoading(false);
      });
  };

  const on2FAChange = (enabled: boolean) => () => {
    setSetting({
      ...setting,
      two_fa_enabled: enabled,
    });
  };

  const onPasskeyAdded = (passkey: Passkey) => {
    setSetting({
      ...setting,
      passkeys: setting.passkeys ? [...setting.passkeys, passkey] : [passkey],
    });
  };

  const onPasskeyDeleted = (passkeyID: string) => {
    setSetting({
      ...setting,
      passkeys: setting.passkeys?.filter((p) => p.id !== passkeyID),
    });
  };

  return (
    <Stack spacing={3}>
      <SettingForm title={t("login.password")} lgWidth={5}>
        <Collapse in={!showResetPassword}>
          <SecondaryButton
            sx={{ mt: 1 }}
            onClick={() => setShowResetPassword(true)}
            variant={"contained"}
            startIcon={<Edit />}
          >
            {t("login.resetPassword")}
          </SecondaryButton>
        </Collapse>
        <Collapse in={showResetPassword} sx={{ mt: 2 }} unmountOnExit>
          <form ref={resetPwdFormRef}>
            <Stack spacing={2}>
              <DenseFilledTextField
                required
                label={t("setting.originalPassword")}
                fullWidth
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                inputProps={{
                  type: "password",
                  minLength: 4,
                  maxLength: 64,
                }}
              />
              <DenseFilledTextField
                required
                label={t("login.newPassword")}
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                inputProps={{
                  type: "password",
                  minLength: 6,
                  maxLength: 128,
                }}
              />
              <DenseFilledTextField
                required
                label={t("login.repeatPassword")}
                fullWidth
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                inputProps={{
                  type: "password",
                  minLength: 6,
                  maxLength: 128,
                }}
              />
              <Box>
                <LoadingButton variant={"contained"} onClick={submitResetPassword} loading={resetLoading}>
                  <span>{t("fileManager.save")}</span>
                </LoadingButton>
              </Box>
            </Stack>
          </form>
        </Collapse>
      </SettingForm>
      <SettingForm
        title={
          <Box>
            {t("setting.2fa")}
            {setting.two_fa_enabled && (
              <SquareChip
                sx={{
                  ml: 1,
                  height: "initial",
                  fontSize: (theme) => theme.typography.caption.fontSize,
                }}
                color={"success"}
                size={"small"}
                variant={"outlined"}
                label={t("setting.enabled")}
              />
            )}
          </Box>
        }
        lgWidth={5}
      >
        <SecondaryButton
          sx={{ mt: 1 }}
          onClick={() => (setting.two_fa_enabled ? setDisable2FAOpen(true) : setEnable2FAOpen(true))}
          variant={"contained"}
          startIcon={<Open />}
        >
          {t(`setting.${setting.two_fa_enabled ? "disable" : "enable"}2FA`)}
        </SecondaryButton>
      </SettingForm>
      {authEnabled && (
        <SettingForm title={t("setting.hardwareAuthenticator")}>
          <PasskeyList setting={setting} onPasskeyAdded={onPasskeyAdded} onPasskeyDeleted={onPasskeyDeleted} />
        </SettingForm>
      )}
      <Enable2FADialog open={enable2FAOpen} onClose={() => setEnable2FAOpen(false)} on2FAEnabled={on2FAChange(true)} />
      <Disable2FADialog
        open={disable2FAOpen}
        onClose={() => setDisable2FAOpen(false)}
        on2FADisabled={on2FAChange(false)}
      />
    </Stack>
  );
};

export default SecuritySetting;
