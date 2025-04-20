import {
  Box,
  Button,
  Grow,
  Table,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TableVirtuoso } from "react-virtuoso";
import { sendCancelDownloadTask, sendSetDownloadTarget } from "../../../api/api.ts";
import { FileType } from "../../../api/explorer.ts";
import { DownloadTaskFile, TaskSummary } from "../../../api/workflow.ts";
import { useAppDispatch } from "../../../redux/hooks.ts";
import { confirmOperation } from "../../../redux/thunks/dialog.ts";
import { fileBase, sizeToString } from "../../../util";
import {
  NoWrapTableCell,
  NoWrapTypography,
  StyledCheckbox,
  StyledTableContainerPaper,
} from "../../Common/StyledComponents.tsx";
import FileIcon from "../../FileManager/Explorer/FileIcon.tsx";
import Dismiss from "../../Icons/Dismiss.tsx";
import { getProgressColor } from "./TaskCard.tsx";

export interface DownloadFileListProps {
  taskId: string;
  summary?: TaskSummary;
  downloading?: boolean;
  readonly?: boolean;
}

const DownloadFileList = ({ taskId, summary, downloading, readonly }: DownloadFileListProps) => {
  const [selectedMask, setSelectedMask] = useState<{
    [key: number]: boolean;
  }>({});
  const [changeApplied, setChangeApplied] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const files = summary?.props?.download?.files;
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const progressColor = useMemo(() => {
    return getProgressColor(theme);
  }, [theme]);

  const setFileSelected = (value: DownloadTaskFile, selected: boolean) => {
    setSelectedMask((prev) => {
      return {
        ...prev,
        [value.index]: selected,
      };
    });
    setChangeApplied(false);
  };

  const submitChanges = () => {
    setLoading(true);
    dispatch(
      sendSetDownloadTarget(taskId, {
        files: Object.keys(selectedMask).map((key) => ({
          index: parseInt(key),
          download: selectedMask[parseInt(key)],
        })),
      }),
    )
      .then(() => {
        setChangeApplied(true);
        enqueueSnackbar({
          message: t("download.operationSubmitted"),
          variant: "success",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const cancelTask = () => {
    dispatch(confirmOperation(t("download.cancelTaskConfirm"))).then(() => {
      setLoading(true);
      dispatch(sendCancelDownloadTask(taskId))
        .then(() => {
          enqueueSnackbar({
            message: t("download.taskCanceled"),
            variant: "success",
          });
        })
        .finally(() => {
          setLoading(false);
        });
    });
  };

  return (
    <Box sx={{ py: readonly ? 0 : 2 }}>
      {files && (
        <TableContainer component={StyledTableContainerPaper}>
          <TableVirtuoso
            style={{
              height: 33 * (files?.length ?? 0) + 0.5,
              overflow: "auto",
              maxHeight: 300,
            }}
            components={{
              // eslint-disable-next-line react/display-name
              Table: (props) => <Table {...props} size={"small"} />,
              // eslint-disable-next-line react/display-name
              TableRow: (props) => {
                const index = props["data-index"];
                const percentage = (files[index]?.progress ?? 0) * 100;
                const progressBgColor = theme.palette.background.default;
                return (
                  <TableRow
                    {...props}
                    key={index}
                    sx={{
                      height: "33px",
                      background: `linear-gradient(to right, ${progressColor} 0%,${progressColor} ${percentage}%,${progressBgColor} ${percentage}%,${progressBgColor} 100%)`,
                    }}
                  />
                );
              },
            }}
            data={files}
            itemContent={(_index, value) => (
              <>
                <TableCell width={50} sx={{ height: "33px" }} component="th" scope="row">
                  <StyledCheckbox
                    onChange={(e) => {
                      setFileSelected(value, e.target.checked);
                    }}
                    disabled={!downloading || readonly}
                    disableRipple
                    checked={selectedMask[value.index] ?? value.selected}
                    size="small"
                  />
                </TableCell>
                <NoWrapTableCell
                  component="th"
                  scope="row"
                  sx={{
                    minWidth: 300,
                    height: "33px",
                    wordBreak: "break-all",
                  }}
                >
                  <Typography variant={"body2"} sx={{ display: "flex" }}>
                    <FileIcon
                      sx={{ px: 0, py: 0, mr: 1, height: "20px" }}
                      variant={"small"}
                      iconProps={{
                        fontSize: "small",
                      }}
                      file={{
                        type: FileType.file,
                        name: value.name,
                      }}
                    />
                    <Tooltip title={value.name}>
                      <NoWrapTypography variant="inherit">{fileBase(value.name)}</NoWrapTypography>
                    </Tooltip>
                  </Typography>
                </NoWrapTableCell>
                <TableCell width={120} component="th" scope="row">
                  <Typography noWrap variant={"body2"}>
                    {sizeToString(value.size)}
                  </Typography>
                </TableCell>
                <TableCell width={105} component="th" scope="row">
                  <Typography noWrap variant={"body2"}>
                    {((value.progress ?? 0) * 100).toFixed(2)} %
                  </Typography>
                </TableCell>
              </>
            )}
          />
        </TableContainer>
      )}
      {downloading && !readonly && summary?.phase == "monitor" && (
        <Box
          sx={{
            display: "flex",
            mt: 2,
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Grow unmountOnExit in={!changeApplied}>
              <Button disabled={loading} onClick={submitChanges} color={"primary"} variant={"contained"}>
                {t("download.saveChanges")}
              </Button>
            </Grow>
          </Box>
          <Button color={"error"} onClick={cancelTask} disabled={loading} startIcon={<Dismiss />} variant={"contained"}>
            {t("download.cancelTask")}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default DownloadFileList;
