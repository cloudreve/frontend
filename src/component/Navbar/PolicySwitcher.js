import React, { useCallback } from "react";
import {
    Avatar,
    CircularProgress,
    IconButton,
    ListItem,
    ListItemAvatar,
    ListItemText,
    makeStyles,
} from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";
import { Nas } from "mdi-material-ui";
import Popover from "@material-ui/core/Popover";
import API from "../../middleware/Api";
import { useDispatch, useSelector } from "react-redux";
import { Backup, Check } from "@material-ui/icons";
import { blue, green } from "@material-ui/core/colors";
import List from "@material-ui/core/List";
import { refreshFileList, toggleSnackbar } from "../../redux/explorer";
import Divider from "@material-ui/core/Divider";
import Box from "@material-ui/core/Box";
import Link from "@material-ui/core/Link";
import { Link as RouterLink } from "react-router-dom";
import pathHelper from "../../utils/page";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
    uploadFromFile: {
        backgroundColor: blue[100],
        color: blue[600],
    },
    policySelected: {
        backgroundColor: green[100],
        color: green[800],
    },
    header: {
        padding: "8px 16px",
        fontSize: 14,
    },
    list: {
        minWidth: 300,
        maxHeight: 600,
        overflow: "auto",
    },
}));

const PolicySwitcher = () => {
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [policies, setPolicies] = React.useState([]);
    const [loading, setLoading] = React.useState(null);
    const policy = useSelector((state) => state.explorer.currentPolicy);
    const path = useSelector((state) => state.navigator.path);
    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );
    const RefreshFileList = useCallback(() => dispatch(refreshFileList()), [
        dispatch,
    ]);
    const search = useSelector((state) => state.explorer.search);

    const handleClick = (event) => {
        if (policies.length === 0) {
            API.get("/user/setting/policies", {})
                .then((response) => {
                    setPolicies(response.data);
                })
                .catch((error) => {
                    ToggleSnackbar("top", "right", error.message, "error");
                });
        }
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const switchTo = (id) => {
        if (id === policy.id) {
            handleClose();
            return;
        }
        setLoading(id);
        API.post("/webdav/mount", {
            path: path,
            policy: id,
        })
            .then(() => {
                ToggleSnackbar(
                    "top",
                    "right",
                    t("vas.folderPolicySwitched"),
                    "success"
                );
                RefreshFileList();
                setLoading(null);
                handleClose();
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
                setLoading(null);
                handleClose();
            });
    };

    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;

    const classes = useStyles();
    return (
        <>
            {pathHelper.isHomePage(location.pathname) && !search && (
                <Tooltip title={t("vas.switchFolderPolicy")} placement="bottom">
                    <IconButton onClick={handleClick} color="inherit">
                        <Nas />
                    </IconButton>
                </Tooltip>
            )}
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
            >
                <div className={classes.header}>
                    <Box color={"text.secondary"}>
                        {t("vas.setPolicyForFolder")}
                    </Box>
                </div>

                <Divider />
                <List className={classes.list}>
                    {policies.map((value, index) => (
                        <ListItem
                            button
                            component="label"
                            key={index}
                            onClick={() => switchTo(value.id)}
                        >
                            <ListItemAvatar>
                                {value.id === loading && (
                                    <CircularProgress
                                        size={35}
                                        color="secondary"
                                    />
                                )}
                                {value.id !== loading && (
                                    <>
                                        {value.id === policy.id && (
                                            <Avatar
                                                className={
                                                    classes.policySelected
                                                }
                                            >
                                                <Check />
                                            </Avatar>
                                        )}
                                        {value.id !== policy.id && (
                                            <Avatar
                                                className={
                                                    classes.uploadFromFile
                                                }
                                            >
                                                <Backup />
                                            </Avatar>
                                        )}
                                    </>
                                )}
                            </ListItemAvatar>
                            <ListItemText primary={value.name} />
                        </ListItem>
                    ))}
                </List>
                <Divider />
                <div className={classes.header}>
                    <Link
                        onClick={() => handleClose()}
                        component={RouterLink}
                        to={"/connect?tab=1"}
                        color={"secondary"}
                    >
                        {t("vas.manageMount")}
                    </Link>
                </div>
            </Popover>
        </>
    );
};

export default PolicySwitcher;
