import { useTranslation } from "react-i18next";
import {
  Box,
  DialogContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks.ts";
import { useCallback, useEffect, useState } from "react";
import DraggableDialog from "../../../Dialogs/DraggableDialog.tsx";
import { setListViewColumnSettingDialog } from "../../../../redux/globalStateSlice.ts";
import AutoHeight from "../../../Common/AutoHeight.tsx";
import { FileManagerIndex } from "../../FileManager.tsx";
import { getColumnTypeDefaults, ListViewColumnSetting } from "./Column.tsx";
import { StyledTableContainerPaper } from "../../../Common/StyledComponents.tsx";
import ArrowDown from "../../../Icons/ArrowDown.tsx";
import Dismiss from "../../../Icons/Dismiss.tsx";
import { setListViewColumns } from "../../../../redux/fileManagerSlice.ts";
import SessionManager, { UserSettings } from "../../../../session";
import AddColumn from "./AddColumn.tsx";
import { useSnackbar } from "notistack";
import { DefaultCloseAction } from "../../../Common/Snackbar/snackbar.tsx";

const ColumnSetting = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [columns, setColumns] = useState<ListViewColumnSetting[]>([]);

  const open = useAppSelector(
    (state) => state.globalState.listViewColumnSettingDialogOpen,
  );
  const listViewColumns = useAppSelector(
    (state) => state.fileManager[FileManagerIndex.main].listViewColumns,
  );

  useEffect(() => {
    if (open) {
      setColumns(listViewColumns ?? []);
    }
  }, [open]);

  const onClose = useCallback(() => {
    dispatch(setListViewColumnSettingDialog(false));
  }, [dispatch]);

  const onSubmitted = useCallback(() => {
    if (columns.length > 0) {
      dispatch(setListViewColumns(columns));
      SessionManager.set(UserSettings.ListViewColumns, columns);
    }
    dispatch(setListViewColumnSettingDialog(false));
  }, [dispatch, columns]);

  const onColumnAdded = useCallback(
    (column: ListViewColumnSetting) => {
      const existed = columns.find((c) => c.type === column.type);
      if (
        !existed ||
        existed.props?.metadata_key != column.props?.metadata_key
      ) {
        setColumns((prev) => [...prev, column]);
      } else {
        enqueueSnackbar(t("application:fileManager.columnExisted"), {
          variant: "warning",
          action: DefaultCloseAction,
        });
      }
    },
    [columns],
  );

  return (
    <DraggableDialog
      title={t("application:fileManager.listColumnSetting")}
      onAccept={onSubmitted}
      showActions
      secondaryAction={<AddColumn onColumnAdded={onColumnAdded} />}
      dialogProps={{
        open: open ?? false,
        onClose: onClose,
        fullWidth: true,
        maxWidth: "sm",
        disableRestoreFocus: true,
      }}
    >
      <DialogContent sx={{ pb: 0 }}>
        <AutoHeight>
          <TableContainer component={StyledTableContainerPaper}>
            <Table sx={{ width: "100%" }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={"50%"}>{t("fileManager.column")}</TableCell>
                  <TableCell>{t("fileManager.actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {columns.map((column, index) => (
                  <TableRow
                    hover
                    key={index}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {t(getColumnTypeDefaults(column).title)}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                        }}
                      >
                        {index > 0 && columns.length > 1 ? (
                          <IconButton
                            size="small"
                            onClick={() => {
                              setColumns((prev) => {
                                const newColumns = [...prev];
                                const temp = newColumns[index];
                                newColumns[index] = newColumns[index - 1];
                                newColumns[index - 1] = temp;
                                return newColumns;
                              });
                            }}
                          >
                            <ArrowDown
                              sx={{
                                width: "18px",
                                height: "18px",
                                transform: "rotate(180deg)",
                              }}
                            />
                          </IconButton>
                        ) : (
                          <Box sx={{ width: 28, height: 28 }} />
                        )}
                        {index < columns.length - 1 && columns.length > 1 ? (
                          <IconButton
                            size="small"
                            onClick={() => {
                              setColumns((prev) => {
                                const newColumns = [...prev];
                                const temp = newColumns[index];
                                newColumns[index] = newColumns[index + 1];
                                newColumns[index + 1] = temp;
                                return newColumns;
                              });
                            }}
                          >
                            <ArrowDown
                              sx={{
                                width: "18px",
                                height: "18px",
                              }}
                            />
                          </IconButton>
                        ) : (
                          <Box sx={{ width: 28, height: 28 }} />
                        )}
                        {columns.length > 1 ? (
                          <IconButton
                            size="small"
                            onClick={() => {
                              setColumns((prev) => {
                                return prev.filter((_, i) => i !== index);
                              });
                            }}
                          >
                            <Dismiss
                              sx={{
                                width: "18px",
                                height: "18px",
                              }}
                            />
                          </IconButton>
                        ) : (
                          <Box sx={{ width: 28, height: 28 }} />
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AutoHeight>
      </DialogContent>
    </DraggableDialog>
  );
};
export default ColumnSetting;
