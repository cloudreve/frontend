import React, { useCallback, useEffect,useMemo } from "react";
import {
    Card,
    CardContent,
    darken,
    IconButton,
    lighten,
    LinearProgress,
    makeStyles,
    Typography,
    useTheme,
} from "@material-ui/core";
import { useDispatch } from "react-redux";
import { hex2bin, sizeToString } from "../../utils";
import PermMediaIcon from "@material-ui/icons/PermMedia";
import TypeIcon from "../FileManager/TypeIcon";
import MuiExpansionPanel from "@material-ui/core/ExpansionPanel";
import MuiExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import MuiExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import withStyles from "@material-ui/core/styles/withStyles";
import Divider from "@material-ui/core/Divider";
import { ExpandMore, HighlightOff } from "@material-ui/icons";
import classNames from "classnames";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Table from "@material-ui/core/Table";
import Badge from "@material-ui/core/Badge";
import Tooltip from "@material-ui/core/Tooltip";
import API from "../../middleware/Api";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import TimeAgo from "timeago-react";
import SelectFileDialog from "../Modals/SelectFile";
import { useHistory } from "react-router";
import { toggleSnackbar } from "../../redux/explorer";
import { useTranslation } from "react-i18next";
import { TableVirtuoso } from "react-virtuoso";

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
    subFile: {
        width: "100%",
        minWidth: 300,
        wordBreak: "break-all",
    },
    subFileName: {
        display: "flex",
    },
    subFileIcon: {
        marginRight: "20px",
    },
    subFileSize: {
        minWidth: 120,
    },
    subFilePercent: {
        minWidth: 105,
    },
    scroll: {
        overflow: "auto",
        maxHeight: "300px",
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
        textAlign: "left",
    },
    infoValue: {
        color: theme.palette.text.secondary,
        textAlign: "left",
        paddingLeft:theme.spacing(1),
    },
    bitmap: {
        width: "100%",
        height: "50px",
        backgroundColor: theme.palette.background.default,
    },
}));

export default function DownloadingCard(props) {
    const { t } = useTranslation("application", { keyPrefix: "download" });
    const { t: tGlobal } = useTranslation();
    const canvasRef = React.createRef();
    const classes = useStyles();
    const theme = useTheme();
    const history = useHistory();

    const [expanded, setExpanded] = React.useState("");
    const [task, setTask] = React.useState(props.task);
    const [loading, setLoading] = React.useState(false);
    const [selectDialogOpen, setSelectDialogOpen] = React.useState(false);
    const [selectFileOption, setSelectFileOption] = React.useState([]);

    const handleChange = (panel) => (event, newExpanded) => {
        setExpanded(newExpanded ? panel : false);
    };

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    useEffect(() => {
        setTask(props.task);
    }, [props.task]);

    useEffect(() => {
        if (task.info.bitfield === "") {
            return;
        }
        let result = "";
        task.info.bitfield.match(/.{1,2}/g).forEach((str) => {
            result += hex2bin(str);
        });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.strokeStyle = theme.palette.primary.main;
        for (let i = 0; i < canvas.width; i++) {
            let bit =
                result[
                    Math.round(((i + 1) / canvas.width) * task.info.numPieces)
                ];
            bit = bit ? bit : result.slice(-1);
            if (bit === "1") {
                context.beginPath();
                context.moveTo(i, 0);
                context.lineTo(i, canvas.height);
                context.stroke();
            }
        }
        // eslint-disable-next-line
    }, [task.info.bitfield, task.info.numPieces, theme]);

    const getPercent = (completed, total) => {
        if (total === 0) {
            return 0;
        }
        return (completed / total) * 100;
    };

    const activeFiles = useCallback(() => {
        return task.info.files.filter((v) => v.selected === "true");
    }, [task.info.files]);

    const deleteFile = (index) => {
        setLoading(true);
        const current = activeFiles();
        const newIndex = [];
        const newFiles = [];
        // eslint-disable-next-line
        current.map((v) => {
            if (v.index !== index && v.selected) {
                newIndex.push(parseInt(v.index));
                newFiles.push({
                    ...v,
                    selected: "true",
                });
            } else {
                newFiles.push({
                    ...v,
                    selected: "false",
                });
            }
        });
        API.put("/aria2/select/" + task.info.gid, {
            indexes: newIndex,
        })
            .then(() => {
                setTask({
                    ...task,
                    info: {
                        ...task.info,
                        files: newFiles,
                    },
                });
                ToggleSnackbar("top", "right", t("taskFileDeleted"), "success");
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                setLoading(false);
            });
    };

    const getDownloadName = useCallback(() => {
        if (task.info.bittorrent.info.name !== "") {
            return task.info.bittorrent.info.name;
        }
        return task.name === "." ? t("unknownTaskName") : task.name;
    }, [task]);

    const getIcon = useCallback(() => {
        if (task.info.bittorrent.mode === "multi") {
            return (
                <Badge badgeContent={activeFiles().length} color="secondary">
                    <PermMediaIcon className={classes.iconMultiple} />
                </Badge>
            );
        } else {
            return (
                <TypeIcon
                    className={classes.iconBig}
                    fileName={getDownloadName(task)}
                />
            );
        }
        // eslint-disable-next-line
    }, [task, classes]);

    const cancel = () => {
        setLoading(true);
        API.delete("/aria2/task/" + task.info.gid)
            .then(() => {
                ToggleSnackbar("top", "right", t("taskCanceled"), "success");
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                setLoading(false);
            });
    };

    const changeSelectedFile = (fileIndex) => {
        setLoading(true);
        API.put("/aria2/select/" + task.info.gid, {
            indexes: fileIndex,
        })
            .then(() => {
                ToggleSnackbar(
                    "top",
                    "right",
                    t("operationSubmitted"),
                    "success"
                );
                setSelectDialogOpen(false);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                setLoading(false);
            });
    };

    const subFileList = useMemo(() => {
        const processStyle = (value) => ({
            background:
                "linear-gradient(to right, " +
                (theme.palette.type ===
                    "dark"
                    ? darken(
                        theme.palette
                            .primary
                            .main,
                        0.4
                    )
                    : lighten(
                        theme.palette
                            .primary
                            .main,
                        0.85
                    )) +
                " 0%," +
                (theme.palette.type ===
                    "dark"
                    ? darken(
                        theme.palette
                            .primary
                            .main,
                        0.4
                    )
                    : lighten(
                        theme.palette
                            .primary
                            .main,
                        0.85
                    )) +
                " " +
                getPercent(
                    value.completedLength,
                    value.length
                ).toFixed(0) +
                "%," +
                theme.palette.background
                    .paper +
                " " +
                getPercent(
                    value.completedLength,
                    value.length
                ).toFixed(0) +
                "%," +
                theme.palette.background
                    .paper +
                " 100%)",
        });

        const subFileCell = (value) => (
            <>
                <TableCell
                    component="th"
                    scope="row"
                    className={classes.subFile}
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
                    className={classes.subFileSize}
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
                    className={classes.subFilePercent}
                >
                    <Typography noWrap>
                        {getPercent(
                            value.completedLength,
                            value.length
                        ).toFixed(2)}
                        %
                    </Typography>
                </TableCell>
                <TableCell>
                    <Tooltip
                        title={t(
                            "deleteThisFile"
                        )}
                    >
                        <IconButton
                            onClick={() =>
                                deleteFile(
                                    value.index
                                )
                            }
                            disabled={loading}
                            size={"small"}
                        >
                            <HighlightOff />
                        </IconButton>
                    </Tooltip>
                </TableCell>
            </>
        );

        return activeFiles().length > 5 ? (
            <TableVirtuoso
                style={{ height: 43 * activeFiles().length }}
                className={classes.scroll}
                components={{
                    // eslint-disable-next-line react/display-name
                    Table: (props) => <Table {...props} size={"small"} />,
                    // eslint-disable-next-line react/display-name
                    TableRow: (props) => {
                        const index = props["data-index"];
                        const value = activeFiles()[index];
                        return (
                            <TableRow
                                {...props}
                                key={index}
                                style={processStyle(value)}
                            />
                        );
                    },
                }}
                data={activeFiles()}
                itemContent={(index, value) => (
                    subFileCell(value)
                )}
            />
        ) : (
            <div className={classes.scroll}>
                <Table size="small">
                    <TableBody>
                        {activeFiles().map((value) => {
                            return (
                                <TableRow
                                    key={value.index}
                                    style={processStyle(value)}
                                >
                                    {subFileCell(value)}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        );
    }, [
        classes,
        theme,
        activeFiles,
    ]);

    return (
        <Card className={classes.card}>
            <SelectFileDialog
                open={selectDialogOpen}
                onClose={() => setSelectDialogOpen(false)}
                modalsLoading={loading}
                files={selectFileOption}
                onSubmit={changeSelectedFile}
            />
            <ExpansionPanel
                square
                expanded={expanded === task.info.gid}
                onChange={handleChange(task.info.gid)}
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
                        <LinearProgress
                            color="secondary"
                            variant="determinate"
                            className={classes.progress}
                            value={getPercent(task.downloaded, task.total)}
                        />
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            noWrap
                        >
                            {task.total > 0 && (
                                <span>
                                    {getPercent(
                                        task.downloaded,
                                        task.total
                                    ).toFixed(2)}
                                    % -{" "}
                                    {task.downloaded === 0
                                        ? "0Bytes"
                                        : sizeToString(task.downloaded)}
                                    /
                                    {task.total === 0
                                        ? "0Bytes"
                                        : sizeToString(task.total)}{" "}
                                    -{" "}
                                    {task.speed === "0"
                                        ? "0B/s"
                                        : sizeToString(task.speed) + "/s"}
                                </span>
                            )}
                            {task.total === 0 && <span> - </span>}
                        </Typography>
                    </CardContent>
                    <CardContent className={classes.contentSide}>
                        <IconButton>
                            <ExpandMore
                                className={classNames(
                                    {
                                        [classes.expanded]:
                                            expanded === task.info.gid,
                                    },
                                    classes.expand
                                )}
                            />
                        </IconButton>
                    </CardContent>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <Divider />
                    {task.info.bittorrent.mode === "multi" && subFileList}
                    <div className={classes.action}>
                        <Button
                            className={classes.actionButton}
                            variant="outlined"
                            color="secondary"
                            onClick={() =>
                                history.push(
                                    "/home?path=" + encodeURIComponent(task.dst)
                                )
                            }
                        >
                            {t("openDstFolder")}
                        </Button>
                        {task.info.bittorrent.mode === "multi" && (
                            <Button
                                className={classes.actionButton}
                                variant="outlined"
                                color="secondary"
                                disabled={loading}
                                onClick={() => {
                                    setSelectDialogOpen(true);
                                    setSelectFileOption([
                                        ...props.task.info.files,
                                    ]);
                                }}
                            >
                                {t("selectDownloadingFile")}
                            </Button>
                        )}
                        <Button
                            className={classes.actionButton}
                            onClick={cancel}
                            variant="contained"
                            color="secondary"
                            disabled={loading}
                        >
                            {t("cancelTask")}
                        </Button>
                    </div>
                    <Divider />
                    <div className={classes.info}>
                        {task.info.bitfield !== "" && (
                            <canvas
                                width={"700"}
                                height={"100"}
                                ref={canvasRef}
                                className={classes.bitmap}
                            />
                        )}

                        <Grid container>
                            <Grid container xs={12} sm={4}>
                                <Grid item xs={5} className={classes.infoTitle}>
                                    {t("updatedAt")}
                                </Grid>
                                <Grid item xs={7} className={classes.infoValue}>
                                    <TimeAgo
                                        datetime={task.update}
                                        locale={tGlobal("timeAgoLocaleCode", {
                                            ns: "common",
                                        })}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container xs={12} sm={4}>
                                <Grid item xs={5} className={classes.infoTitle}>
                                    {t("uploaded")}
                                </Grid>
                                <Grid item xs={7} className={classes.infoValue}>
                                    {sizeToString(task.info.uploadLength)}
                                </Grid>
                            </Grid>
                            <Grid container xs={12} sm={4}>
                                <Grid item xs={5} className={classes.infoTitle}>
                                    {t("uploadSpeed")}
                                </Grid>
                                <Grid item xs={7} className={classes.infoValue}>
                                    {sizeToString(task.info.uploadSpeed)} / s
                                </Grid>
                            </Grid>
                            {task.info.bittorrent.mode !== "" && (
                                <>
                                    <Grid container xs={12} sm={8}>
                                        <Grid
                                            item
                                            sm={2}
                                            xs={4}
                                            className={classes.infoTitle}
                                        >
                                            {t("InfoHash")}
                                        </Grid>
                                        <Grid
                                            item
                                            sm={10}
                                            xs={8}
                                            style={{
                                                wordBreak: "break-all",
                                            }}
                                            className={classes.infoValue}
                                        >
                                            {task.info.infoHash}
                                        </Grid>
                                    </Grid>
                                    <Grid container xs={12} sm={4}>
                                        <Grid
                                            item
                                            xs={5}
                                            className={classes.infoTitle}
                                        >
                                            {t("seederCount")}
                                        </Grid>
                                        <Grid
                                            item
                                            xs={7}
                                            className={classes.infoValue}
                                        >
                                            {task.info.numSeeders}
                                        </Grid>
                                    </Grid>
                                    <Grid container xs={12} sm={4}>
                                        <Grid
                                            item
                                            xs={5}
                                            className={classes.infoTitle}
                                        >
                                            {t("seeding")}
                                        </Grid>
                                        <Grid
                                            item
                                            xs={7}
                                            className={classes.infoValue}
                                        >
                                            {task.info.seeder === "true"
                                                ? t("isSeeding")
                                                : t("notSeeding")}
                                        </Grid>
                                    </Grid>
                                </>
                            )}
                            <Grid container xs={12} sm={4}>
                                <Grid item xs={5} className={classes.infoTitle}>
                                    {t("chunkSize")}
                                </Grid>
                                <Grid item xs={7} className={classes.infoValue}>
                                    {sizeToString(task.info.pieceLength)}
                                </Grid>
                            </Grid>
                            <Grid container xs={12} sm={4}>
                                <Grid item xs={5} className={classes.infoTitle}>
                                    {t("chunkNumbers")}
                                </Grid>
                                <Grid item xs={7} className={classes.infoValue}>
                                    {task.info.numPieces}
                                </Grid>
                            </Grid>
                            {props.task.node && <Grid container xs={12} sm={4}>
                                <Grid item xs={5} className={classes.infoTitle}>
                                    {t("downloadNode")}
                                </Grid>
                                <Grid item xs={7} className={classes.infoValue}>
                                    {props.task.node}
                                </Grid>
                            </Grid>}
                        </Grid>
                    </div>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        </Card>
    );
}
