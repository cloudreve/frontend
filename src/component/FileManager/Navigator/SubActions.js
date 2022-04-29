import React, { useCallback, useState } from "react";
import { IconButton, makeStyles, Menu, MenuItem } from "@material-ui/core";
import ViewListIcon from "@material-ui/icons/ViewList";
import ViewSmallIcon from "@material-ui/icons/ViewComfy";
import ViewModuleIcon from "@material-ui/icons/ViewModule";
import TextTotateVerticalIcon from "@material-ui/icons/TextRotateVertical";
import Avatar from "@material-ui/core/Avatar";
import { useDispatch, useSelector } from "react-redux";
import Auth from "../../../middleware/Auth";
import { changeViewMethod, setShareUserPopover } from "../../../redux/explorer";
import { changeSortMethod } from "../../../redux/explorer/action";
import { FormatPageBreak } from "mdi-material-ui";
import pathHelper from "../../../utils/page";
import { changePageSize } from "../../../redux/viewUpdate/action";

const useStyles = makeStyles((theme) => ({
    sideButton: {
        padding: "8px",
        marginRight: "5px",
    },
}));

const sortOptions = [
    "A-Z",
    "Z-A",
    "最早上传",
    "最新上传",
    "最早修改",
    "最新修改",
    "最小",
    "最大",
];

const paginationOption = ["50", "100", "200", "500", "1000"];

export default function SubActions({ isSmall, inherit }) {
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
    const SetShareUserPopover = useCallback(
        (e) => dispatch(setShareUserPopover(e)),
        [dispatch]
    );
    const ChangePageSize = useCallback((e) => dispatch(changePageSize(e)), [
        dispatch,
    ]);
    const [anchorSort, setAnchorSort] = useState(null);
    const [anchorPagination, setAnchorPagination] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const showSortOptions = (e) => {
        setAnchorSort(e.currentTarget);
    };
    const showPaginationOptions = (e) => {
        setAnchorPagination(e.currentTarget);
    };
    const handleMenuItemClick = (e, index) => {
        setSelectedIndex(index);
        const optionsTable = {
            0: "namePos",
            1: "nameRev",
            2: "timePos",
            3: "timeRev",
            4: "modifyTimePos",
            5: "modifyTimeRev",
            6: "sizePos",
            7: "sizeRes",
        };
        ChangeSortMethod(optionsTable[index]);
        setAnchorSort(null);
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
            {viewMethod === "icon" && (
                <IconButton
                    title="列表展示"
                    className={classes.sideButton}
                    onClick={toggleViewMethod}
                    color={inherit ? "inherit" : "default"}
                >
                    <ViewListIcon fontSize={isSmall ? "small" : "default"} />
                </IconButton>
            )}
            {viewMethod === "list" && (
                <IconButton
                    title="小图标展示"
                    className={classes.sideButton}
                    onClick={toggleViewMethod}
                    color={inherit ? "inherit" : "default"}
                >
                    <ViewSmallIcon fontSize={isSmall ? "small" : "default"} />
                </IconButton>
            )}

            {viewMethod === "smallIcon" && (
                <IconButton
                    title="大图标展示"
                    className={classes.sideButton}
                    onClick={toggleViewMethod}
                    color={inherit ? "inherit" : "default"}
                >
                    <ViewModuleIcon fontSize={isSmall ? "small" : "default"} />
                </IconButton>
            )}

            {!isMobile && (
                <IconButton
                    title="分页大小"
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
                        {`${option} / 页`}
                    </MenuItem>
                ))}
                <MenuItem
                    selected={pageSize === -1}
                    onClick={() => handlePaginationChange(-1)}
                >
                    不分页
                </MenuItem>
            </Menu>

            <IconButton
                title="排序方式"
                className={classes.sideButton}
                onClick={showSortOptions}
                color={inherit ? "inherit" : "default"}
            >
                <TextTotateVerticalIcon
                    fontSize={isSmall ? "small" : "default"}
                />
            </IconButton>
            <Menu
                id="sort-menu"
                anchorEl={anchorSort}
                open={Boolean(anchorSort)}
                onClose={() => setAnchorSort(null)}
            >
                {sortOptions.map((option, index) => (
                    <MenuItem
                        key={option}
                        selected={index === selectedIndex}
                        onClick={(event) => handleMenuItemClick(event, index)}
                    >
                        {option}
                    </MenuItem>
                ))}
            </Menu>
            {share && (
                <IconButton
                    title={"由 " + share.creator.nick + " 创建"}
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
