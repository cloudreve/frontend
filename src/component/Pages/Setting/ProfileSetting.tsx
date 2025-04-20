import { LoadingButton } from "@mui/lab";
import { Collapse, Grid2, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { sendUpdateUserSetting } from "../../../api/api.ts";
import { UserSettings } from "../../../api/user.ts";
import { useAppDispatch } from "../../../redux/hooks.ts";
import SessionManager from "../../../session";
import { DenseFilledTextField } from "../../Common/StyledComponents.tsx";
import TimeBadge from "../../Common/TimeBadge.tsx";
import AvatarSetting from "./AvatarSetting.tsx";
import SettingForm from "./SettingForm.tsx";

export interface ProfileSettingProps {
  setting: UserSettings;
  setSetting: (setting: UserSettings) => void;
}

const ProfileSetting = ({ setting, setSetting }: ProfileSettingProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const nickRef = useRef<HTMLInputElement>(null);

  const user = SessionManager.currentLoginOrNull();
  const [nick, setNick] = useState(user?.user.nickname);
  const [nickLoading, setNickLoading] = useState(false);

  const onClick = () => {
    // Validate input length
    if (nickRef.current && nickRef.current.checkValidity()) {
      setNickLoading(true);
      dispatch(sendUpdateUserSetting({ nick }))
        .then(() => {
          if (user?.user) {
            SessionManager.updateUserIfExist({
              ...user?.user,
              nickname: nick ?? "",
            });
          }
        })
        .finally(() => {
          setNickLoading(false);
        });
    } else {
      // Input is invalid, show validation errors
      nickRef.current?.reportValidity();
    }
  };

  return (
    <Stack spacing={3}>
      <Grid2
        container
        spacing={isMobile ? 3 : 4}
        direction={isMobile ? "column" : "row-reverse"}
        sx={{ width: "100%" }}
      >
        <Grid2 spacing={3} sx={{ flexGrow: 1, width: "100%" }} size={{ md: 6, xs: 12 }}>
          {user && <AvatarSetting user={user?.user} />}
        </Grid2>
        <Grid2 spacing={3} sx={{ flexGrow: 1, width: "100%" }} size={{ md: 6, xs: 12 }}>
          <Stack spacing={3}>
            <SettingForm title={t("login.email")} noContainer lgWidth={12}>
              <DenseFilledTextField disabled fullWidth value={user?.user.email} />
            </SettingForm>
            <SettingForm title={t("setting.nickname")} noContainer lgWidth={12}>
              <DenseFilledTextField
                fullWidth
                onChange={(e) => setNick(e.target.value)}
                value={nick}
                required
                inputProps={{ maxLength: 255 }}
                helperText={t("setting.nickNameDes")}
                inputRef={nickRef}
              />
              <Collapse in={nick != user?.user.nickname}>
                <LoadingButton variant={"contained"} onClick={onClick} loading={nickLoading} sx={{ mt: 1 }}>
                  <span>{t("fileManager.save")}</span>
                </LoadingButton>
              </Collapse>
            </SettingForm>
            <Grid2 spacing={isMobile ? 3 : 4} container sx={{ width: "100%" }}>
              <SettingForm title={t("setting.uid")} noContainer lgWidth={6}>
                <Typography variant={"body2"} color={"textSecondary"}>
                  {user?.user.id}
                </Typography>
              </SettingForm>
              <SettingForm title={t("setting.regTime")} noContainer lgWidth={6}>
                <Typography variant={"body2"} color={"textSecondary"}>
                  <TimeBadge datetime={user?.user.created_at} variant={"inherit"} />
                </Typography>
              </SettingForm>
            </Grid2>

            <SettingForm title={t("setting.group")} noContainer lgWidth={12}>
              <Typography variant={"body2"} color={"textSecondary"}>
                {user?.user.group?.name}
              </Typography>
            </SettingForm>
          </Stack>
        </Grid2>
      </Grid2>
    </Stack>
  );
};

export default ProfileSetting;
