import React, { useCallback, useEffect, useState } from "react";
import { makeStyles, Typography } from "@material-ui/core";
import { useDispatch } from "react-redux";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import API from "../../middleware/Api";
import { getTaskProgress, getTaskStatus, getTaskType } from "../../config";
import Pagination from "@material-ui/lab/Pagination";
import { formatLocalTime } from "../../utils/datetime";
import { toggleSnackbar } from "../../redux/explorer";
import Nothing from "../Placeholder/Nothing";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
    layout: {
        width: "auto",
        marginTop: "50px",
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
            width: 1100,
            marginLeft: "auto",
            marginRight: "auto",
        },
        marginBottom: "50px",
    },
    content: {
        marginTop: theme.spacing(4),
        overflowX: "auto",
    },
    cardContent: {
        padding: theme.spacing(2),
    },
    tableContainer: {
        overflowX: "auto",
    },
    create: {
        marginTop: theme.spacing(2),
    },
    noWrap: {
        wordBreak: "keepAll",
    },
    footer: {
        padding: theme.spacing(2),
    },
}));

export default function Tasks() {
    const { t } = useTranslation();
    const [tasks, setTasks] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const loadList = (page) => {
        API.get("/user/setting/tasks?page=" + page)
            .then((response) => {
                setTasks(response.data.tasks);
                setTotal(response.data.total);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    };

    useEffect(() => {
        loadList(page);
        // eslint-disable-next-line
    }, [page]);

    const getError = (error) => {
        if (error === "") {
            return "-";
        }
        try {
            const res = JSON.parse(error);
            return `${res.msg}: ${res.error}`;
        } catch (e) {
            return t("uploader.unknownStatus");
        }
    };

    const classes = useStyles();

    return (
        <div className={classes.layout}>
            <Typography color="textSecondary" variant="h4">
                {t("navbar.taskQueue")}
            </Typography>
            <Paper elevation={3} className={classes.content}>
                <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell nowrap="nowrap">
                                {t("setting.createdAt")}
                            </TableCell>
                            <TableCell nowrap="nowrap" align="right">
                                {t("setting.taskType")}
                            </TableCell>
                            <TableCell nowrap="nowrap" align="right">
                                {t("setting.taskStatus")}
                            </TableCell>
                            <TableCell nowrap="nowrap" align="right">
                                {t("setting.lastProgress")}
                            </TableCell>
                            <TableCell nowrap="nowrap">
                                {t("setting.errorDetails")}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tasks.map((row, id) => (
                            <TableRow key={id}>
                                <TableCell
                                    nowrap="nowrap"
                                    component="th"
                                    scope="row"
                                >
                                    {formatLocalTime(row.create_date)}
                                </TableCell>
                                <TableCell nowrap="nowrap" align="right">
                                    {getTaskType(row.type)}
                                </TableCell>
                                <TableCell nowrap="nowrap" align="right">
                                    {getTaskStatus(row.status)}
                                </TableCell>
                                <TableCell nowrap="nowrap" align="right">
                                    {getTaskProgress(row.type, row.progress)}
                                </TableCell>
                                <TableCell className={classes.noWrap}>
                                    {getError(row.error)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {tasks.length === 0 && (
                    <Nothing primary={t("setting.listEmpty")} />
                )}
                <div className={classes.footer}>
                    <Pagination
                        count={Math.ceil(total / 10)}
                        onChange={(e, v) => setPage(v)}
                        color="secondary"
                    />
                </div>
            </Paper>
        </div>
    );
}
