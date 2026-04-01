import { Stack, useMediaQuery, useTheme } from "@mui/material";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import { downloadAllFiles } from "../../../redux/thunks/download.ts";
import { Filesystem } from "../../../util/uri.ts";
import { RadiusFrame } from "../../Frame/RadiusFrame.tsx";
import Download from "../../Icons/Download.tsx";
import { FmIndexContext } from "../FmIndexContext.tsx";
import { SearchIndicator } from "../Search/SearchIndicator.tsx";
import Breadcrumb from "./Breadcrumb.tsx";
import TopActions, { ActionButton, ActionButtonGroup } from "./TopActions.tsx";
import TopActionsSecondary from "./TopActionsSecondary.tsx";

const NavHeader = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const fmIndex = useContext(FmIndexContext);
  const fs = useAppSelector((state) => state.fileManager[fmIndex].current_fs);
  const isSingleFileView = useAppSelector((state) => state.fileManager[fmIndex].list?.single_file_view);
  const showDownloadFolder = fs == Filesystem.share && !isSingleFileView;
  return (
    <Stack
      direction={"row"}
      spacing={1}
      sx={{
        px: isMobile ? 2 : "initial",
      }}
    >
      <RadiusFrame
        sx={{
          flexGrow: 1,
          p: 0.5,
          overflow: "hidden",
          display: "flex",
        }}
        withBorder
      >
        <Breadcrumb />
        <SearchIndicator />
      </RadiusFrame>
      {!isMobile && (
        <RadiusFrame>
          <TopActionsSecondary />
        </RadiusFrame>
      )}
      <RadiusFrame>
        <TopActions />
      </RadiusFrame>
      {showDownloadFolder && (
        <RadiusFrame>
          <ActionButtonGroup variant="outlined">
            <ActionButton
              startIcon={!isMobile && <Download />}
              onClick={() => dispatch(downloadAllFiles(fmIndex))}
              sx={{ color: "primary.main" }}
            >
              {isMobile ? <Download fontSize={"small"} /> : t("application:fileManager.downloadFolder")}
            </ActionButton>
          </ActionButtonGroup>
        </RadiusFrame>
      )}
    </Stack>
  );
};

export default NavHeader;
