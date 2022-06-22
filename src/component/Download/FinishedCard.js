import React, { useCallback } from "react";
import {
    Card,
    CardContent,
    IconButton,
    makeStyles,
    Typography,
    useTheme,
} from "@material-ui/core";
import { sizeToString } from "../../utils";
import PermMediaIcon from "@material-ui/icons/PermMedia";
import TypeIcon from "../FileManager/TypeIcon";
import MuiExpansionPanel from "@material-ui/core/ExpansionPanel";
import MuiExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import MuiExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import withStyles from "@material-ui/core/styles/withStyles";
import Divider from "@material-ui/core/Divider";
import { ExpandMore } from "@material-ui/icons";
import classNames from "classnames";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Table from "@material-ui/core/Table";
import Badge from "@material-ui/core/Badge";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import API from "../../middleware/Api";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { formatLocalTime } from "../../utils/datetime";
import { toggleSnackbar } from "../../redux/explorer";
import { useTranslation } from "react-i18next";

const ExpansionPanel = withStyles({
    root: {
        maxWidth: "100%",
        boxShadow: "none",
        "&:not(:last-child)": {
            borderBottom: 0,
        },
        "&:before": {
            display: "none",
        },
        "&$expanded": {},
    },
    expanded: {},
})(MuiExpansionPanel);

const ExpansionPanelSummary = withStyles({
    root: {
        minHeight: 0,
        padding: 0,

        "&$expanded": {
            minHeight: 56,
        },
    },
    content: {
        maxWidth: "100%",
        margin: 0,
        display: "flex",
        "&$expanded": {
            margin: "0",
        },
    },
    expanded: {},
})(MuiExpansionPanelSummary);

const ExpansionPanelDetails = withStyles((theme) => ({
    root: {
        display: "block",
        padding: theme.spacing(0),
    },
}))(MuiExpansionPanelDetails);

const useStyles = makeStyles((theme) => ({
    card: {
        marginTop: "20px",
        justifyContent: "space-between",
    },
    iconContainer: {
        width: "90px",
        height: "96px",
        padding: " 35px 29px 29px 29px",
        paddingLeft: "35px",
        [theme.breakpoints.down("sm")]: {
            display: "none",
        },
    },
    content: {
        width: "100%",
        minWidth: 0,
        [theme.breakpoints.up("sm")]: {
            borderInlineStart: "1px " + theme.palette.divider + " solid",
        },
        textAlign: "left",
    },
    contentSide: {
        minWidth: 0,
        paddingTop: "24px",
        paddingRight: "28px",
        [theme.breakpoints.down("sm")]: {
            display: "none",
        },
    },
    iconBig: {
        fontSize: "30px",
    },
    iconMultiple: {
        fontSize: "30px",
        color: "#607D8B",
    },
    progress: {
        marginTop: 8,
        marginBottom: 4,
    },
    expand: {
        transition: ".15s transform ease-in-out",
    },
    expanded: {
        transform: "rotate(180deg)",
    },
    subFileName: {
        display: "flex",
    },
    subFileIcon: {
        marginRight: "20px",
    },
    scroll: {
        overflowY: "auto",
    },
    action: {
        padding: theme.spacing(2),
        textAlign: "right",
    },
    actionButton: {
        marginLeft: theme.spacing(1),
    },
    info: {
        padding: theme.spacing(2),
    },
    infoTitle: {
        fontWeight: 700,
    },
    infoValue: {
        color: theme.palette.text.secondary,
    },
}));

export default function FinishedCard(props) {
    const { t } = useTranslation("application", { keyPrefix: "download" });
    const classes = useStyles();
    const theme = useTheme();
    const history = useHistory();

    const [expanded, setExpanded] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const handleChange = () => (event, newExpanded) => {
        setExpanded(!!newExpanded);
    };

    const getPercent = (completed, total) => {
        if (total === 0) {
            return 0;
        }
        return (completed / total) * 100;
    };

    const cancel = () => {
        setLoading(true);
        API.delete("/aria2/task/" + props.task.gid)
            .then(() => {
                ToggleSnackbar("top", "right", t("taskDeleted"), "success");
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                window.location.reload();
            });
    };

    const getDownloadName = useCallback(() => {
        return props.task.name === "." ? t("unknownTaskName") : props.task.name;
    }, [props.task.name]);

    const activeFiles = useCallback(() => {
        return props.task.files.filter((v) => v.selected === "true");
    }, [props.task.files]);

    const getIcon = useCallback(() => {
        if (props.task.files.length > 1) {
            return (
                <Badge badgeContent={activeFiles().length} color="secondary">
                    <PermMediaIcon className={classes.iconMultiple} />
                </Badge>
            );
        } else {
            return (
                <TypeIcon
                    className={classes.iconBig}
                    fileName={getDownloadName(props.task)}
                />
            );
        }
    }, [props.task, classes]);

    const getTaskError = (error) => {
        try {
            const res = JSON.parse(error);
            return res.msg + "：" + res.error;
        } catch (e) {
            return t("transferFailed");
        }
    };

    return (
        <Card className={classes.card}>
            <ExpansionPanel
                square
                expanded={expanded}
                onChange={handleChange("")}
            >
                <ExpansionPanelSummary
                    aria-controls="panel1d-content"
                    id="panel1d-header"
                >
                    <div className={classes.iconContainer}>{getIcon()}</div>
                    <CardContent className={classes.content}>
                        <Typography color="primary" noWrap>
                            <Tooltip title={getDownloadName()}>
                                <span>{getDownloadName()}</span>
                            </Tooltip>
                        </Typography>
                        {props.task.status === 3 && (
                            <Tooltip title={props.task.error}>
                                <Typography
                                    variant="body2"
                                    color="error"
                                    noWrap
                                >
                                    {t("downloadFailed", {
                                        msg: props.task.error,
                                    })}
                                </Typography>
                            </Tooltip>
                        )}
                        {props.task.status === 5 && (
                            <Typography
                                variant="body2"
                                color="textSecondary"
                                noWrap
                            >
                                {t("canceledStatus")}
                                {props.task.error !== "" && (
                                    <span>({props.task.error})</span>
                                )}
                            </Typography>
                        )}
                        {props.task.status === 4 &&
                            props.task.task_status === 4 && (
                                <Typography
                                    variant="body2"
                                    style={{
                                        color: theme.palette.success.main,
                                    }}
                                    noWrap
                                >
                                    {t("finishedStatus")}
                                </Typography>
                            )}
                        {props.task.status === 4 &&
                            props.task.task_status === 0 && (
                                <Typography
                                    variant="body2"
                                    style={{
                                        color: theme.palette.success.light,
                                    }}
                                    noWrap
                                >
                                    {t("transferring")}
                                </Typography>
                            )}
                        {props.task.status === 4 &&
                            props.task.task_status === 1 && (
                                <Typography
                                    variant="body2"
                                    style={{
                                        color: theme.palette.success.light,
                                    }}
                                    noWrap
                                >
                                    {t("transferring")}
                                </Typography>
                            )}
                        {props.task.status === 4 &&
                            props.task.task_status === 2 && (
                                <Typography
                                    variant="body2"
                                    color={"error"}
                                    noWrap
                                >
                                    {getTaskError(props.task.task_error)}
                                </Typography>
                            )}
                    </CardContent>
                    <CardContent className={classes.contentSide}>
                        <IconButton>
                            <ExpandMore
                                className={classNames(
                                    {
                                        [classes.expanded]: expanded,
                                    },
                                    classes.expand
                                )}
                            />
                        </IconButton>
                    </CardContent>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <Divider />
                    {props.task.files.length > 1 && (
                        <div className={classes.scroll}>
                            <Table>
                                <TableBody>
                                    {activeFiles().map((value) => {
                                        return (
                                            <TableRow key={value.index}>
                                                <TableCell
                                                    component="th"
                                                    scope="row"
                                                >
                                                    <Typography
                                                        className={
                                                            classes.subFileName
                                                        }
                                                    >
                                                        <TypeIcon
                                                            className={
                                                                classes.subFileIcon
                                                            }
                                                            fileName={
                                                                value.path
                                                            }
                                                        />
                                                        {value.path}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell
                                                    component="th"
                                                    scope="row"
                                                >
                                                    <Typography noWrap>
                                                        {" "}
                                                        {sizeToString(
                                                            value.length
                                                        )}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell
                                                    component="th"
                                                    scope="row"
                                                >
                                                    <Typography noWrap>
                                                        {getPercent(
                                                            value.completedLength,
                                                            value.length
                                                        ).toFixed(2)}
                                                        %
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <div className={classes.action}>
                        <Button
                            className={classes.actionButton}
                            variant="outlined"
                            color="secondary"
                            onClick={() =>
                                history.push(
                                    "/home?path=" +
                                        encodeURIComponent(props.task.dst)
                                )
                            }
                        >
                            {t("openDstFolder")}
                        </Button>
                        <Button
                            className={classes.actionButton}
                            onClick={cancel}
                            variant="contained"
                            color="secondary"
                            disabled={loading}
                        >
                            {t("deleteRecord")}
                        </Button>
                    </div>
                    <Divider />
                    <div className={classes.info}>
                        <Grid container>
                            <Grid container xs={12} sm={6}>
                                <Grid item xs={5} className={classes.infoTitle}>
                                    {t("createdAt")}
                                </Grid>
                                <Grid item xs={7} className={classes.infoValue}>
                                    {formatLocalTime(props.task.create)}
                                </Grid>
                            </Grid>
                            <Grid container xs={12} sm={6}>
                                <Grid item xs={5} className={classes.infoTitle}>
                                    {t("updatedAt")}
                                </Grid>
                                <Grid item xs={7} className={classes.infoValue}>
                                    {formatLocalTime(props.task.update)}
                                </Grid>
                            </Grid>
                        </Grid>
                    </div>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        </Card>
    );
}
