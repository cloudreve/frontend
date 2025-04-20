import { RadiusFrame } from "../../Frame/RadiusFrame.tsx";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import { Box, Collapse } from "@mui/material";
import SidebarContent from "./SidebarContent.tsx";
import { useCallback, useEffect, useState } from "react";
import { FileResponse } from "../../../api/explorer.ts";
import { getFileInfo } from "../../../api/api.ts";

export interface SideBarProps {
  inPhotoViewer?: boolean;
}

const Sidebar = ({ inPhotoViewer }: SideBarProps) => {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.globalState.sidebarOpen);
  const sidebarTarget = useAppSelector(
    (state) => state.globalState.sidebarTarget,
  );
  // null: not valid, undefined: not loaded, FileResponse: loaded
  const [target, setTarget] = useState<FileResponse | undefined | null>(
    undefined,
  );

  const loadExtendedInfo = useCallback(
    (path: string) => {
      dispatch(
        getFileInfo({
          uri: path,
          extended: true,
        }),
      ).then((res) => {
        setTarget(res);
      });
    },
    [target, dispatch, setTarget],
  );

  useEffect(() => {
    if (sidebarTarget && sidebarOpen) {
      if (typeof sidebarTarget === "string") {
      } else {
        setTarget(sidebarTarget);
        loadExtendedInfo(sidebarTarget.path);
      }
    } else {
      setTarget(null);
    }
  }, [sidebarTarget, setTarget]);

  return (
    <Box
      sx={
        inPhotoViewer
          ? {
              position: "absolute",
              height: "100%",
              right: 0,
              top: 0,
            }
          : {}
      }
    >
      <Collapse
        in={sidebarOpen}
        sx={{ height: "100%" }}
        orientation={"horizontal"}
        unmountOnExit
        timeout={inPhotoViewer ? 0 : "auto"}
      >
        <RadiusFrame
          sx={{
            width: "300px",
            height: "100%",
            ml: 1,
            borderRadius: (theme) =>
              inPhotoViewer ? 0 : theme.shape.borderRadius / 8,
          }}
          withBorder={!inPhotoViewer}
        >
          <SidebarContent inPhotoViewer={inPhotoViewer} target={target} />
        </RadiusFrame>
      </Collapse>
    </Box>
  );
};

export default Sidebar;
