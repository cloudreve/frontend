import { Box, Stack } from "@mui/material";
import { useSnackbar } from "notistack";
import { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../../../redux/hooks";
import { SettingContext } from "../../Settings/SettingWrapper";
import FileViewerList from "./FileViewerList";

const ViewerSetting = () => {
  const { t } = useTranslation("dashboard");
  const { formRef, setSettings, values } = useContext(SettingContext);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const viewerOnChange = useCallback(
    (s: string) =>
      setSettings({
        file_viewers: s,
      }),
    [],
  );

  return (
    <Box component={"form"} ref={formRef} onSubmit={(e) => e.preventDefault()}>
      <Stack spacing={5}>
        <FileViewerList config={values.file_viewers} onChange={viewerOnChange} />
      </Stack>
    </Box>
  );
};

export default ViewerSetting;
