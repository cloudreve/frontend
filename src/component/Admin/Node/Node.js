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
import { useHistory } from "react-router";
import IconButton from "@material-ui/core/IconButton";
import {
    Cancel,
    CheckCircle,
    Delete,
    Edit,
    Pause,
    PlayArrow,
} from "@material-ui/icons";
import Tooltip from "@material-ui/core/Tooltip";
import Chip from "@material-ui/core/Chip";
import classNames from "classnames";
import Box from "@material-ui/core/Box";
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
    disabledBadge: {
        marginLeft: theme.spacing(1),
        height: 18,
    },
    disabledCell: {
        color: theme.palette.text.disabled,
    },
    verticalAlign: {
        verticalAlign: "middle",
        display: "inline-block",
    },
}));

const columns = [
    { id: "#", minWidth: 50 },
    { id: "name", minWidth: 170 },
    {
        id: "status",
        minWidth: 50,
    },
    {
        id: "features",
        minWidth: 170,
    },
    {
        id: "action",
        minWidth: 170,
    },
];

const features = [
    {
        field: "Aria2Enabled",
        name: "remoteDownload",
    },
];

export default function Node() {
    const { t } = useTranslation("dashboard", { keyPrefix: "node" });
    const classes = useStyles();
    const [nodes, setNodes] = useState([]);
    const [isActive, setIsActive] = useState({});
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    const history = useHistory();

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const loadList = () => {
        API.post("/admin/node/list", {
            page: page,
            page_size: pageSize,
            order_by: "id desc",
        })
            .then((response) => {
                setNodes(response.data.items);
                setTotal(response.data.total);
                setIsActive(response.data.active);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    };

    const toggleNode = (id, desired) => {
        setLoading(true);
        API.patch("/admin/node/enable/" + id + "/" + desired)
            .then((response) => {
                loadList();
                ToggleSnackbar(
                    "top",
                    "right",
                    desired === 1 ? t("nodeDisabled") : t("nodeEnabled"),
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

    const deleteNode = (id) => {
        setLoading(true);
        API.delete("/admin/node/" + id)
            .then(() => {
                loadList();
                ToggleSnackbar("top", "right", t("nodeDeleted"), "success");
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        loadList();
    }, [page, pageSize]);

    const getStatusBadge = (status) => {
        if (status === 1) {
            return (
                <Chip
                    className={classes.disabledBadge}
                    size="small"
                    label={t("disabled")}
                />
            );
        }
    };

    const getFeatureBadge = (node) =>
        features.map((feature) => {
            if (node[feature.field]) {
                return (
                    <Chip
                        className={classes.disabledBadge}
                        size="small"
                        color="primary"
                        label={t(feature.name)}
                    />
                );
            }
        });

    const getRealStatusBadge = (status) =>
        status ? (
            <Box color="success.main" fontSize="small">
                <CheckCircle
                    className={classes.verticalAlign}
                    fontSize="small"
                />{" "}
                <span className={classes.verticalAlign}>{t("online")}</span>
            </Box>
        ) : (
            <Box color="error.main" fontSize="small">
                <Cancel className={classes.verticalAlign} fontSize="small" />{" "}
                <span className={classes.verticalAlign}>{t("offline")}</span>
            </Box>
        );

    return (
        <div>
            <div className={classes.header}>
                <Button
                    color={"primary"}
                    onClick={() => history.push("/admin/node/add")}
                    variant={"contained"}
                >
                    {t("addNewNode")}
                </Button>
                <div className={classes.headerRight}>
                    <Button
                        color={"primary"}
                        onClick={() => loadList()}
                        variant={"outlined"}
                    >
                        {t("refresh")}
                    </Button>
                </div>
            </div>

            <Paper square className={classes.tableContainer}>
                <TableContainer className={classes.container}>
                    <Table aria-label="sticky table" size={"small"}>
                        <TableHead>
                            <TableRow style={{ height: 52 }}>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align}
                                        style={{
                                            minWidth: column.minWidthclassNames,
                                        }}
                                    >
                                        {t(column.id)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {nodes.map((row) => (
                                <TableRow hover key={row.ID}>
                                    <TableCell>{row.ID}</TableCell>
                                    <TableCell
                                        className={classNames({
                                            [classes.disabledCell]:
                                                row.Status === 1,
                                        })}
                                    >
                                        {row.Name}
                                        {getStatusBadge(row.Status)}
                                    </TableCell>
                                    <TableCell>
                                        {getRealStatusBadge(isActive[row.ID])}
                                    </TableCell>
                                    <TableCell>
                                        {getFeatureBadge(row)}
                                    </TableCell>

                                    <TableCell align={"right"}>
                                        <Tooltip
                                            title={
                                                row.Status === 1
                                                    ? t("enableNode")
                                                    : t("disableNode")
                                            }
                                        >
                                            <IconButton
                                                disabled={loading}
                                                onClick={() =>
                                                    toggleNode(
                                                        row.ID,
                                                        1 - row.Status
                                                    )
                                                }
                                                size={"small"}
                                            >
                                                {row.Status === 1 && (
                                                    <PlayArrow />
                                                )}
                                                {row.Status !== 1 && <Pause />}
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t("edit")}>
                                            <IconButton
                                                disabled={loading}
                                                onClick={() =>
                                                    history.push(
                                                        "/admin/node/edit/" +
                                                            row.ID
                                                    )
                                                }
                                                size={"small"}
                                            >
                                                <Edit />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t("delete")}>
                                            <IconButton
                                                onClick={() =>
                                                    deleteNode(row.ID)
                                                }
                                                disabled={loading}
                                                size={"small"}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
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
