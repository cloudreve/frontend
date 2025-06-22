import Add from "../Icons/Add.tsx";
import { Button, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../redux/hooks.ts";
import { openNewContextMenu } from "../../redux/thunks/filemanager.ts";
import { FileManagerIndex } from "./FileManager.tsx";

const NewButton = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (isMobile) {
    return (
      <IconButton onClick={(e) => dispatch(openNewContextMenu(FileManagerIndex.main, e))}>
        <Add />
      </IconButton>
    );
  }

  return (
    <Button
      variant={"contained"}
      onClick={(e) => dispatch(openNewContextMenu(FileManagerIndex.main, e))}
      startIcon={<Add />}
      color={"primary"}
    >
      {t("fileManager.new")}
    </Button>
  );
};

export default NewButton;
