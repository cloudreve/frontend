import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import SidebarContent from "./SidebarContent.tsx";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { FileResponse } from "../../../api/explorer.ts";
import { getFileInfo } from "../../../api/api.ts";
import { SideBarProps } from "./Sidebar.tsx";
import { Dialog, Slide } from "@mui/material";
import { closeSidebar } from "../../../redux/globalStateSlice.ts";
import { TransitionProps } from "@mui/material/transitions";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const SidebarDialog = ({ inPhotoViewer }: SideBarProps) => {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.globalState.sidebarOpen);
  const sidebarTarget = useAppSelector((state) => state.globalState.sidebarTarget);
  // null: not valid, undefined: not loaded, FileResponse: loaded
  const [target, setTarget] = useState<FileResponse | undefined | null>(undefined);

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
    <Dialog
      fullScreen
      TransitionComponent={Transition}
      open={!!sidebarOpen}
      onClose={() => {
        dispatch(closeSidebar());
      }}
    >
      <SidebarContent inPhotoViewer={inPhotoViewer} target={target} />
    </Dialog>
  );
};

export default SidebarDialog;
