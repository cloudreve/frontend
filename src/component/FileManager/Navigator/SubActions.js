import React, { useCallback, useState } from "react";
import { IconButton, makeStyles, Menu, MenuItem } from "@material-ui/core";
import ViewListIcon from "@material-ui/icons/ViewList";
import ViewSmallIcon from "@material-ui/icons/ViewComfy";
import ViewModuleIcon from "@material-ui/icons/ViewModule";
import DownloadIcon from "@material-ui/icons/CloudDownload";
import SaveIcon from "@material-ui/icons/Save";
import ReportIcon from "@material-ui/icons/Report";
import Avatar from "@material-ui/core/Avatar";
import { useDispatch, useSelector } from "react-redux";
import Auth from "../../../middleware/Auth";
import { changeSortMethod, startBatchDownload } from "../../../redux/explorer/action";
import {
    changeViewMethod,
    openResaveDialog,
    setShareUserPopover,
} from "../../../redux/explorer";
import { FormatPageBreak } from "mdi-material-ui";
import pathHelper from "../../../utils/page";
import { changePageSize } from "../../../redux/viewUpdate/action";
import Report from "../../Modals/Report";
import { useTranslation } from "react-i18next";
import Sort from "../Sort";

const useStyles = makeStyles((theme) => ({
    sideButton: {
        padding: "8px",
        marginRight: "5px",
    },
}));

// const sortOptions = [
//     "A-Z",
//     "Z-A",
//     "oldestUploaded",
//     "newestUploaded",
//     "oldestModified",
//     "newestModified",
//     "smallest",
//     "largest",
// ];

const paginationOption = ["50", "100", "200", "500", "1000"];

export default function SubActions({ isSmall, inherit }) {
    const { t } = useTranslation("application", { keyPrefix: "fileManager" });
    const { t: vasT } = useTranslation("application", { keyPrefix: "vas" });
    const dispatch = useDispatch();
    const viewMethod = useSelector(
        (state) => state.viewUpdate.explorerViewMethod
    );
    const share = useSelector((state) => state.viewUpdate.shareInfo);
    const pageSize = useSelector((state) => state.viewUpdate.pagination.size);
    const OpenLoadingDialog = useCallback(
        (method) => dispatch(changeViewMethod(method)),
        [dispatch]
    );
    const ChangeSortMethod = useCallback(
        (method) => dispatch(changeSortMethod(method)),
        [dispatch]
    );
    const OpenResaveDialog = useCallback(
        (key) => dispatch(openResaveDialog(key)),
        [dispatch]
    );
    const SetShareUserPopover = useCallback(
        (e) => dispatch(setShareUserPopover(e)),
        [dispatch]
    );
    const StartBatchDownloadAll = useCallback(
        () => dispatch(startBatchDownload(share)),
        [dispatch, share]
    );
    const ChangePageSize = useCallback((e) => dispatch(changePageSize(e)), [
        dispatch,
    ]);
    // const [anchorSort, setAnchorSort] = useState(null);
    const [anchorPagination, setAnchorPagination] = useState(null);
    // const [selectedIndex, setSelectedIndex] = useState(0);
    const [openReport, setOpenReport] = useState(false);
    // const showSortOptions = (e) => {
    //     setAnchorSort(e.currentTarget);
    // };
    const showPaginationOptions = (e) => {
        setAnchorPagination(e.currentTarget);
    };

    /** change sort */
    const onChangeSort = (value) => {
        ChangeSortMethod(value);
    };
    const handlePaginationChange = (s) => {
        ChangePageSize(s);
        setAnchorPagination(null);
    };

    const toggleViewMethod = () => {
        const newMethod =
            viewMethod === "icon"
                ? "list"
                : viewMethod === "list"
                    ? "smallIcon"
                    : "icon";
        Auth.SetPreference("view_method", newMethod);
        OpenLoadingDialog(newMethod);
    };
    const isMobile = pathHelper.isMobile();

    const classes = useStyles();
    return (
        <>
            <IconButton
                title={t("batchDownload")}
                className={classes.sideButton}
                onClick={StartBatchDownloadAll}
                color={inherit ? "inherit" : "default"}
            >
                <DownloadIcon fontSize={isSmall ? "small" : "default"} />
            </IconButton>

            {viewMethod === "icon" && (
                <IconButton
                    title={t("listView")}
                    className={classes.sideButton}
                    onClick={toggleViewMethod}
                    color={inherit ? "inherit" : "default"}
                >
                    <ViewListIcon fontSize={isSmall ? "small" : "default"} />
                </IconButton>
            )}
            {viewMethod === "list" && (
                <IconButton
                    title={t("gridViewSmall")}
                    className={classes.sideButton}
                    onClick={toggleViewMethod}
                    color={inherit ? "inherit" : "default"}
                >
                    <ViewSmallIcon fontSize={isSmall ? "small" : "default"} />
                </IconButton>
            )}

            {viewMethod === "smallIcon" && (
                <IconButton
                    title={t("gridViewLarge")}
                    className={classes.sideButton}
                    onClick={toggleViewMethod}
                    color={inherit ? "inherit" : "default"}
                >
                    <ViewModuleIcon fontSize={isSmall ? "small" : "default"} />
                </IconButton>
            )}

            {!isMobile && (
                <IconButton
                    title={t("paginationSize")}
                    className={classes.sideButton}
                    onClick={showPaginationOptions}
                    color={inherit ? "inherit" : "default"}
                >
                    <FormatPageBreak fontSize={isSmall ? "small" : "default"} />
                </IconButton>
            )}
            <Menu
                id="sort-menu"
                anchorEl={anchorPagination}
                open={Boolean(anchorPagination)}
                onClose={() => setAnchorPagination(null)}
            >
                {paginationOption.map((option, index) => (
                    <MenuItem
                        key={option}
                        selected={option === pageSize.toString()}
                        onClick={() => handlePaginationChange(parseInt(option))}
                    >
                        {t("paginationOption", { option })}
                    </MenuItem>
                ))}
                <MenuItem
                    selected={pageSize === -1}
                    onClick={() => handlePaginationChange(-1)}
                >
                    {t("noPagination")}
                </MenuItem>
            </Menu>

            <Sort
                isSmall={isSmall}
                inherit={inherit}
                className={classes.sideButton}
                onChange={onChangeSort}
            />

            {share && (
                <>
                    <IconButton
                        title={vasT("saveToMyFiles")}
                        className={classes.sideButton}
                        onClick={() => OpenResaveDialog(share.key)}
                        color={inherit ? "inherit" : "default"}
                    >
                        <SaveIcon fontSize={isSmall ? "small" : "default"} />
                    </IconButton>
                    {!inherit && (
                        <>
                            <IconButton
                                title={vasT("report")}
                                className={classes.sideButton}
                                onClick={() => setOpenReport(true)}
                            >
                                <ReportIcon
                                    fontSize={isSmall ? "small" : "default"}
                                />
                            </IconButton>
                            <Report
                                open={openReport}
                                share={share}
                                onClose={() => setOpenReport(false)}
                            />
                        </>
                    )}
                </>
            )}
            {share && (
                <IconButton
                    title={t("shareCreateBy", { nick: share.creator.nick })}
                    className={classes.sideButton}
                    onClick={(e) => SetShareUserPopover(e.currentTarget)}
                    style={{ padding: 5 }}
                >
                    <Avatar
                        style={{ height: 23, width: 23 }}
                        src={"/api/v3/user/avatar/" + share.creator.key + "/s"}
                    />
                </IconButton>
            )}
        </>
    );
}
