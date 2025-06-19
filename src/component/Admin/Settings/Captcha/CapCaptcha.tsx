import { Trans, useTranslation } from "react-i18next";
import { FormControl, Link, Stack } from "@mui/material";
import SettingForm from "../../../Pages/Setting/SettingForm.tsx";
import { DenseFilledTextField } from "../../../Common/StyledComponents.tsx";
import * as React from "react";
import { NoMarginHelperText } from "../Settings.tsx";

export interface CapCaptchaProps {
  values: {
    [key: string]: string;
  };
  setSettings: (settings: { [key: string]: string }) => void;
}

const CapCaptcha = ({ values, setSettings }: CapCaptchaProps) => {
  const { t } = useTranslation("dashboard");
  return (
    <Stack spacing={3}>
      <SettingForm title={t("settings.capInstanceURL")} lgWidth={5}>
        <FormControl fullWidth>
          <DenseFilledTextField
            value={values.captcha_cap_instance_url}
            onChange={(e) =>
              setSettings({
                captcha_cap_instance_url: e.target.value,
              })
            }
            placeholder="https://cap.example.com"
            required
          />
          <NoMarginHelperText>
            <Trans
              i18nKey="settings.capInstanceURLDes"
              ns={"dashboard"}
              components={[
                <Link
                  key={0}
                  href={"https://capjs.js.org/guide/standalone.html"}
                  target={"_blank"}
                />,
              ]}
            />
          </NoMarginHelperText>
        </FormControl>
      </SettingForm>
      <SettingForm title={t("settings.capKeyID")} lgWidth={5}>
        <FormControl fullWidth>
          <DenseFilledTextField
            value={values.captcha_cap_key_id}
            onChange={(e) =>
              setSettings({
                captcha_cap_key_id: e.target.value,
              })
            }
            required
          />
          <NoMarginHelperText>
            <Trans
              i18nKey="settings.capKeyIDDes"
              ns={"dashboard"}
              components={[
                <Link
                  key={0}
                  href={"https://capjs.js.org/guide/standalone.html"}
                  target={"_blank"}
                />,
              ]}
            />
          </NoMarginHelperText>
        </FormControl>
      </SettingForm>
      <SettingForm title={t("settings.capKeySecret")} lgWidth={5}>
        <FormControl fullWidth>
          <DenseFilledTextField
            value={values.captcha_cap_key_secret}
            onChange={(e) =>
              setSettings({
                captcha_cap_key_secret: e.target.value,
              })
            }
            type="password"
            required
          />
          <NoMarginHelperText>
            <Trans
              i18nKey="settings.capKeySecretDes"
              ns={"dashboard"}
              components={[
                <Link
                  key={0}
                  href={"https://capjs.js.org/guide/standalone.html"}
                  target={"_blank"}
                />,
              ]}
            />
          </NoMarginHelperText>
        </FormControl>
      </SettingForm>
    </Stack>
  );
};

export default CapCaptcha; 