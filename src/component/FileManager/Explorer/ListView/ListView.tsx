import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import {
  getColumnTypeDefaults,
  ListViewColumn,
  ListViewColumnSetting,
} from "./Column.tsx";
import ListHeader from "./ListHeader.tsx";
import ListBody from "./ListBody.tsx";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks.ts";
import { FmIndexContext } from "../../FmIndexContext.tsx";
import { setListViewColumns } from "../../../../redux/fileManagerSlice.ts";
import SessionManager, { UserSettings } from "../../../../session";
import { SearchLimitReached } from "../EmptyFileList.tsx";

const ListView = React.forwardRef(
  (
    {
      ...rest
    }: {
      [key: string]: any;
    },
    ref,
  ) => {
    const { t } = useTranslation("application");
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const dispatch = useAppDispatch();
    const fmIndex = useContext(FmIndexContext);
    const recursion_limit_reached = useAppSelector(
      (state) => state.fileManager[fmIndex].list?.recursion_limit_reached,
    );
    const columnSetting = useAppSelector(
      (state) => state.fileManager[fmIndex].listViewColumns,
    );

    const [columns, setColumns] = useState<ListViewColumn[]>(
      columnSetting.map(
        (c): ListViewColumn => ({
          type: c.type,
          width: c.width,
          defaults: getColumnTypeDefaults(c, isMobile),
        }),
      ),
    );

    useEffect(() => {
      setColumns(
        columnSetting.map(
          (c): ListViewColumn => ({
            type: c.type,
            width: c.width,
            defaults: getColumnTypeDefaults(c, isMobile),
          }),
        ),
      );
    }, [columnSetting]);

    const totalWidth = useMemo(() => {
      return columns.reduce(
        (acc, column) => acc + (column.width ?? column.defaults.width),
        0,
      );
    }, [columns]);

    const commitColumnSetting = useCallback(() => {
      let settings: ListViewColumnSetting[] = [];
      setColumns((prev) => {
        settings = [
          ...prev.map((c) => ({
            type: c.type,
            width: c.width,
          })),
        ];
        return prev;
      });
      if (settings.length > 0) {
        dispatch(setListViewColumns(settings));
        SessionManager.set(UserSettings.ListViewColumns, settings);
      }
    }, [dispatch, setColumns]);

    return (
      <Box
        ref={ref}
        {...rest}
        sx={{
          minWidth: totalWidth + 44,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ListHeader
          commitColumnSetting={commitColumnSetting}
          setColumns={setColumns}
          columns={columns}
        />
        <ListBody columns={columns} />
        {recursion_limit_reached && (
          <Box sx={{ px: 1, py: 1 }}>
            <SearchLimitReached />
          </Box>
        )}
      </Box>
    );
  },
);

export default ListView;
