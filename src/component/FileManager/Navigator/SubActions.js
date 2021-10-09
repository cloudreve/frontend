import { useTranslation } from "react-i18next";
import i18next from "i18next";
import React, { useCallback, useState } from "react";
import { IconButton, makeStyles, Menu, MenuItem } from "@material-ui/core";
import ViewListIcon from "@material-ui/icons/ViewList";
import ViewSmallIcon from "@material-ui/icons/ViewComfy";
import ViewModuleIcon from "@material-ui/icons/ViewModule";
import TextTotateVerticalIcon from "@material-ui/icons/TextRotateVertical";
import Avatar from "@material-ui/core/Avatar";
import { useDispatch, useSelector } from "react-redux";
import Auth from "../../../middleware/Auth";
import { changeViewMethod, setShareUserPopover } from "../../../actions";
import { changeSortMethod } from "../../../redux/explorer/action";

const useStyles = makeStyles((theme) => ({
    sideButton: {
        padding: "8px",
        marginRight: "5px",
    },
}));

const sortOptions = ["A-Z", "Z-A", i18next.t('Early'), i18next.t('up to date'), i18next.t('Minimum'), i18next.t('maximum')];

export default function SubActions({ isSmall, share, inherit }) {
    const dispatch = useDispatch();
    const viewMethod = useSelector(
        (state) => state.viewUpdate.explorerViewMethod
    );
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
    const [anchorSort, setAnchorSort] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const { t } = useTranslation();
    
    const showSortOptions = (e) => {
        setAnchorSort(e.currentTarget);
    };
    const handleMenuItemClick = (e, index) => {
        setSelectedIndex(index);
        const optionsTable = {
            0: "namePos",
            1: "nameRev",
            2: "timePos",
            3: "timeRev",
            4: "sizePos",
            5: "sizeRes",
        };
        ChangeSortMethod(optionsTable[index]);
        setAnchorSort(null);
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

    const classes = useStyles();
    return <>
        {viewMethod === "icon" && (
            <IconButton
                title={t('List display')}
                className={classes.sideButton}
                onClick={toggleViewMethod}
                color={inherit ? "inherit" : "default"}
            >
                <ViewListIcon fontSize={isSmall ? "small" : "default"} />
            </IconButton>
        )}
        {viewMethod === "list" && (
            <IconButton
                title={t('Small icon display')}
                className={classes.sideButton}
                onClick={toggleViewMethod}
                color={inherit ? "inherit" : "default"}
            >
                <ViewSmallIcon fontSize={isSmall ? "small" : "default"} />
            </IconButton>
        )}

        {viewMethod === "smallIcon" && (
            <IconButton
                title={t('Large icon display')}
                className={classes.sideButton}
                onClick={toggleViewMethod}
                color={inherit ? "inherit" : "default"}
            >
                <ViewModuleIcon fontSize={isSmall ? "small" : "default"} />
            </IconButton>
        )}

        <IconButton
            title={t('Sort by')}
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
                title={t('Depend on ') + share.creator.nick + t('Create')}
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
    </>;
}
