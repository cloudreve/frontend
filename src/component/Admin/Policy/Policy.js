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
import { sizeToString } from "../../../utils";
import TableBody from "@material-ui/core/TableBody";
import TablePagination from "@material-ui/core/TablePagination";
import AddPolicy from "../Dialogs/AddPolicy";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { useHistory, useLocation } from "react-router";
import IconButton from "@material-ui/core/IconButton";
import { Delete, Edit } from "@material-ui/icons";
import Tooltip from "@material-ui/core/Tooltip";
import Menu from "@material-ui/core/Menu";
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
}));

const columns = [
    { id: "#", label: "sharp", minWidth: 50 },
    { id: "name", label: "name", minWidth: 170 },
    { id: "type", label: "type", minWidth: 170 },
    {
        id: "count",
        label: "childFiles",
        minWidth: 50,
        align: "right",
    },
    {
        id: "size",
        label: "totalSize",
        minWidth: 100,
        align: "right",
    },
    {
        id: "action",
        label: "actions",
        minWidth: 170,
        align: "right",
    },
];

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function Policy() {
    const { t } = useTranslation("dashboard", { keyPrefix: "policy" });
    const classes = useStyles();
    const [policies, setPolicies] = useState([]);
    const [statics, setStatics] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [addDialog, setAddDialog] = useState(false);
    const [filter, setFilter] = useState("all");
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [editID, setEditID] = React.useState(0);

    const location = useLocation();
    const history = useHistory();
    const query = useQuery();

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    useEffect(() => {
        if (query.get("code") === "0") {
            ToggleSnackbar("top", "right", t("authSuccess"), "success");
        } else if (query.get("msg") && query.get("msg") !== "") {
            ToggleSnackbar(
                "top",
                "right",
                query.get("msg") + ", " + query.get("err"),
                "warning"
            );
        }
    }, [location]);

    const loadList = () => {
        API.post("/admin/policy/list", {
            page: page,
            page_size: pageSize,
            order_by: "id desc",
            conditions: filter === "all" ? {} : { type: filter },
        })
            .then((response) => {
                setPolicies(response.data.items);
                setStatics(response.data.statics);
                setTotal(response.data.total);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    };

    useEffect(() => {
        loadList();
    }, [page, pageSize, filter]);

    const deletePolicy = (id) => {
        API.delete("/admin/policy/" + id)
            .then(() => {
                loadList();
                ToggleSnackbar("top", "right", t("policyDeleted"), "success");
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    };

    const open = Boolean(anchorEl);

    return (
        <div>
            <AddPolicy open={addDialog} onClose={() => setAddDialog(false)} />
            <div className={classes.header}>
                <Button
                    color={"primary"}
                    onClick={() => setAddDialog(true)}
                    variant={"contained"}
                >
                    {t("newStoragePolicy")}
                </Button>
                <div className={classes.headerRight}>
                    <Select
                        style={{
                            marginRight: 8,
                        }}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        {[
                            "all",
                            "local",
                            "remote",
                            "qiniu",
                            "upyun",
                            "oss",
                            "cos",
                            "onedrive",
                            "s3",
                        ].map((v) => (
                            <MenuItem key={v} value={v}>
                                {t(v)}
                            </MenuItem>
                        ))}
                    </Select>
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
                                        style={{ minWidth: column.minWidth }}
                                    >
                                        {t(column.label)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {policies.map((row) => (
                                <TableRow hover key={row.ID}>
                                    <TableCell>{row.ID}</TableCell>
                                    <TableCell>{row.Name}</TableCell>
                                    <TableCell>{t(row.Type)}</TableCell>
                                    <TableCell align={"right"}>
                                        {statics[row.ID] !== undefined &&
                                            statics[row.ID][0].toLocaleString()}
                                    </TableCell>
                                    <TableCell align={"right"}>
                                        {statics[row.ID] !== undefined &&
                                            sizeToString(statics[row.ID][1])}
                                    </TableCell>
                                    <TableCell align={"right"}>
                                        <Tooltip title={t("delete")}>
                                            <IconButton
                                                onClick={() =>
                                                    deletePolicy(row.ID)
                                                }
                                                size={"small"}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t("edit")}>
                                            <IconButton
                                                onClick={(e) => {
                                                    setEditID(row.ID);
                                                    handleClick(e);
                                                }}
                                                size={"small"}
                                            >
                                                <Edit />
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
            <Menu
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                keepMounted
            >
                <MenuItem
                    onClick={(e) => {
                        handleClose(e);
                        history.push("/admin/policy/edit/pro/" + editID);
                    }}
                >
                    {t("editInProMode")}
                </MenuItem>
                <MenuItem
                    onClick={(e) => {
                        handleClose(e);
                        history.push("/admin/policy/edit/guide/" + editID);
                    }}
                >
                    {t("editInWizardMode")}
                </MenuItem>
            </Menu>
        </div>
    );
}
