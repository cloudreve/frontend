import { Box, Stack } from "@mui/material";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { SettingSection } from "../Settings";
import { SettingContext } from "../SettingWrapper";
import ThemeOptions from "./ThemeOptions";

const Appearance = () => {
  const { t } = useTranslation("dashboard");
  const { formRef, setSettings, values } = useContext(SettingContext);

  return (
    <Box component={"form"} ref={formRef} onSubmit={(e) => e.preventDefault()}>
      <Stack spacing={5}>
        <SettingSection>
          <ThemeOptions
            value={values.theme_options || "{}"}
            onChange={(value: string) => setSettings({ theme_options: value })}
            defaultTheme={values.defaultTheme || ""}
            onDefaultThemeChange={(value: string) => setSettings({ defaultTheme: value })}
          />
        </SettingSection>
      </Stack>
    </Box>
  );
};

export default Appearance;
