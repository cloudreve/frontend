import { FileResponse } from "../../../api/explorer.ts";
import { Box, IconButton, Skeleton, Typography } from "@mui/material";
import FileIcon from "../Explorer/FileIcon.tsx";
import Dismiss from "../../Icons/Dismiss.tsx";
import { useAppDispatch } from "../../../redux/hooks.ts";
import { closeSidebar } from "../../../redux/globalStateSlice.ts";

export interface HeaderProps {
  target: FileResponse | undefined | null;
}
const Header = ({ target }: HeaderProps) => {
  const dispatch = useAppDispatch();
  return (
    <Box sx={{ display: "flex", p: 2 }}>
      {target !== null && <FileIcon sx={{ p: 0 }} loading={target == undefined} file={target} type={target?.type} />}
      {target !== null && (
        <Box sx={{ flexGrow: 1, ml: 1.5 }}>
          <Typography color="textPrimary" sx={{ wordBreak: "break-all" }} variant={"subtitle2"}>
            {target && target.name}
            {!target && <Skeleton variant={"text"} width={75} />}
          </Typography>
        </Box>
      )}
      <IconButton
        onClick={() => {
          dispatch(closeSidebar());
        }}
        sx={{
          ml: 1,
          placeSelf: "flex-start",
          position: "relative",
          top: "-4px",
        }}
        size={"small"}
      >
        <Dismiss fontSize={"small"} />
      </IconButton>
    </Box>
  );
};

export default Header;
