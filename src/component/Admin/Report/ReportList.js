import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import API from "../../../middleware/Api";
import { useDispatch } from "react-redux";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import TablePagination from "@material-ui/core/TablePagination";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Checkbox from "@material-ui/core/Checkbox";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { lighten } from "@material-ui/core";
import Link from "@material-ui/core/Link";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import { reportReasons } from "../../../config";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import { Delete } from "@material-ui/icons";
import { formatLocalTime } from "../../../utils/datetime";
import { toggleSnackbar } from "../../../redux/explorer";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
    root: {
        [theme.breakpoints.up("md")]: {
            marginLeft: 100,
        },
        marginBottom: 40,
    },
    content: {
        padding: theme.spacing(2),
    },
    container: {
        overflowX: "auto",
    },
    tableContainer: {
        marginTop: 16,
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
    },
    headerRight: {},
    highlight:
        theme.palette.type === "light"
            ? {
                  color: theme.palette.secondary.main,
                  backgroundColor: lighten(theme.palette.secondary.light, 0.85),
              }
            : {
                  color: theme.palette.text.primary,
                  backgroundColor: theme.palette.secondary.dark,
              },
    visuallyHidden: {
        border: 0,
        clip: "rect(0 0 0 0)",
        height: 1,
        margin: -1,
        overflow: "hidden",
        padding: 0,
        position: "absolute",
        top: 20,
        width: 1,
    },
}));

export default function ReportList() {
    const { t } = useTranslation("dashboard", { keyPrefix: "vas" });
    const { t: tApp } = useTranslation("application");
    const { t: tDashboard } = useTranslation("dashboard");
    const classes = useStyles();
    const [reports, setReports] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [users, setUsers] = useState({});
    const [orderBy, setOrderBy] = useState(["id", "desc"]);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ids, setIds] = useState({});

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const loadList = () => {
        API.post("/admin/report/list", {
            page: page,
            page_size: pageSize,
            order_by: orderBy.join(" "),
        })
            .then((response) => {
                setUsers(response.data.users);
                setReports(response.data.items);
                setTotal(response.data.total);
                setIds(response.data.ids);
                setSelected([]);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    };

    useEffect(() => {
        loadList();
    }, [page, pageSize, orderBy]);

    const deleteReport = (id) => {
        setLoading(true);
        API.post("/admin/report/delete", { id: [id] })
            .then(() => {
                loadList();
                ToggleSnackbar("top", "right", t("markSuccessful"), "success");
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                setLoading(false);
            });
    };

    const deleteShare = (id) => {
        setLoading(true);
        API.post("/admin/share/delete", { id: [id] })
            .then(() => {
                loadList();
                ToggleSnackbar(
                    "top",
                    "right",
                    tDashboard("share.deleted"),
                    "success"
                );
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                setLoading(false);
            });
    };

    const deleteBatch = () => {
        setLoading(true);
        API.post("/admin/report/delete", { id: selected })
            .then(() => {
                loadList();
                ToggleSnackbar("top", "right", t("markSuccessful"), "success");
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                setLoading(false);
            });
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = reports.map((n) => n.ID);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, name) => {
        const selectedIndex = selected.indexOf(name);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, name);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1)
            );
        }

        setSelected(newSelected);
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;

    return (
        <div>
            <div className={classes.header}>
                <div className={classes.headerRight}>
                    <Button
                        color={"primary"}
                        onClick={() => loadList()}
                        variant={"outlined"}
                    >
                        {tDashboard("policy.refresh")}
                    </Button>
                </div>
            </div>

            <Paper square className={classes.tableContainer}>
                {selected.length > 0 && (
                    <Toolbar className={classes.highlight}>
                        <Typography
                            style={{ flex: "1 1 100%" }}
                            color="inherit"
                            variant="subtitle1"
                        >
                            {tDashboard("user.selectedObjects", {
                                num: selected.length,
                            })}
                        </Typography>
                        <Tooltip title={t("markAsResolved")}>
                            <IconButton
                                onClick={deleteBatch}
                                disabled={loading}
                                aria-label="delete"
                            >
                                <CheckCircleOutlineIcon />
                            </IconButton>
                        </Tooltip>
                    </Toolbar>
                )}
                <TableContainer className={classes.container}>
                    <Table aria-label="sticky table" size={"small"}>
                        <TableHead>
                            <TableRow style={{ height: 52 }}>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={
                                            selected.length > 0 &&
                                            selected.length < reports.length
                                        }
                                        checked={
                                            reports.length > 0 &&
                                            selected.length === reports.length
                                        }
                                        onChange={handleSelectAllClick}
                                        inputProps={{
                                            "aria-label": "select all desserts",
                                        }}
                                    />
                                </TableCell>
                                <TableCell style={{ minWidth: 10 }}>
                                    <TableSortLabel
                                        active={orderBy[0] === "id"}
                                        direction={orderBy[1]}
                                        onClick={() =>
                                            setOrderBy([
                                                "id",
                                                orderBy[1] === "asc"
                                                    ? "desc"
                                                    : "asc",
                                            ])
                                        }
                                    >
                                        #
                                        {orderBy[0] === "id" ? (
                                            <span
                                                className={
                                                    classes.visuallyHidden
                                                }
                                            >
                                                {orderBy[1] === "desc"
                                                    ? "sorted descending"
                                                    : "sorted ascending"}
                                            </span>
                                        ) : null}
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell style={{ minWidth: 130 }}>
                                    {t("reportedContent")}
                                </TableCell>
                                <TableCell style={{ minWidth: 90 }}>
                                    {tDashboard("policy.type")}
                                </TableCell>
                                <TableCell style={{ minWidth: 90 }}>
                                    {t("reason")}
                                </TableCell>
                                <TableCell style={{ minWidth: 150 }}>
                                    {t("description")}
                                </TableCell>
                                <TableCell style={{ minWidth: 100 }}>
                                    {tDashboard("vas.shareLink")}
                                </TableCell>
                                <TableCell style={{ minWidth: 150 }}>
                                    {t("reportTime")}
                                </TableCell>
                                <TableCell style={{ minWidth: 80 }}>
                                    {tDashboard("policy.actions")}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reports.map((row) => (
                                <TableRow
                                    hover
                                    key={row.ID}
                                    role="checkbox"
                                    selected={isSelected(row.ID)}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            onClick={(event) =>
                                                handleClick(event, row.ID)
                                            }
                                            checked={isSelected(row.ID)}
                                        />
                                    </TableCell>
                                    <TableCell>{row.ID}</TableCell>
                                    <TableCell
                                        style={{ wordBreak: "break-all" }}
                                    >
                                        {row.Share.ID === 0 && t("invalid")}
                                        {row.Share.ID > 0 && (
                                            <Link
                                                target={"_blank"}
                                                color="inherit"
                                                href={
                                                    "/s/" +
                                                    ids[row.Share.ID] +
                                                    (row.Share.Password === ""
                                                        ? ""
                                                        : "?password=" +
                                                          row.Share.Password)
                                                }
                                            >
                                                {row.Share.SourceName}
                                            </Link>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {row.Share.ID > 0 &&
                                            (row.Share.IsDir
                                                ? tDashboard("share.folder")
                                                : tDashboard("share.file"))}
                                    </TableCell>
                                    <TableCell>
                                        {tApp(reportReasons[row.Reason])}
                                    </TableCell>
                                    <TableCell
                                        style={{ wordBreak: "break-all" }}
                                    >
                                        {row.Description}
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            href={
                                                "/admin/user/edit/" +
                                                row.Share.UserID
                                            }
                                        >
                                            {users[row.Share.UserID]
                                                ? users[row.Share.UserID].Nick
                                                : tDashboard(
                                                      "file.unknownUploader"
                                                  )}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {formatLocalTime(row.CreatedAt)}
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title={t("markAsResolved")}>
                                            <IconButton
                                                disabled={loading}
                                                onClick={() =>
                                                    deleteReport(row.ID)
                                                }
                                                size={"small"}
                                            >
                                                <CheckCircleOutlineIcon />
                                            </IconButton>
                                        </Tooltip>
                                        {row.Share.ID > 0 && (
                                            <Tooltip title={t("deleteShare")}>
                                                <IconButton
                                                    disabled={loading}
                                                    onClick={() =>
                                                        deleteShare(
                                                            row.Share.ID
                                                        )
                                                    }
                                                    size={"small"}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={total}
                    rowsPerPage={pageSize}
                    page={page - 1}
                    onChangePage={(e, p) => setPage(p + 1)}
                    onChangeRowsPerPage={(e) => {
                        setPageSize(e.target.value);
                        setPage(1);
                    }}
                />
            </Paper>
        </div>
    );
}
