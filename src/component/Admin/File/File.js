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
import { useHistory } from "react-router";
import IconButton from "@material-ui/core/IconButton";
import { Delete, DeleteForever, FilterList, LinkOff } from "@material-ui/icons";
import Tooltip from "@material-ui/core/Tooltip";
import Checkbox from "@material-ui/core/Checkbox";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { lighten } from "@material-ui/core";
import Link from "@material-ui/core/Link";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Badge from "@material-ui/core/Badge";
import FileFilter from "../Dialogs/FileFilter";
import { formatLocalTime } from "../../../utils/datetime";
import { toggleSnackbar } from "../../../redux/explorer";
import Chip from "@material-ui/core/Chip";
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
        alignItems: "flex-start",
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
    disabledBadge: {
        marginLeft: theme.spacing(1),
        height: 18,
    },
}));

export default function File() {
    const { t } = useTranslation("dashboard", { keyPrefix: "file" });
    const { t: tDashboard } = useTranslation("dashboard");
    const classes = useStyles();
    const [files, setFiles] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState({});
    const [users, setUsers] = useState({});
    const [search, setSearch] = useState({});
    const [orderBy, setOrderBy] = useState(["id", "desc"]);
    const [filterDialog, setFilterDialog] = useState(false);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(false);

    const history = useHistory();

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const loadList = () => {
        API.post("/admin/file/list", {
            page: page,
            page_size: pageSize,
            order_by: orderBy.join(" "),
            conditions: filter,
            searches: search,
        })
            .then((response) => {
                setFiles(response.data.items);
                setTotal(response.data.total);
                setSelected([]);
                setUsers(response.data.users);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    };

    useEffect(() => {
        loadList();
    }, [page, pageSize, orderBy, filter, search]);

    const deleteFile = (id, unlink = false) => {
        setLoading(true);
        API.post("/admin/file/delete", { id: [id], unlink })
            .then(() => {
                loadList();
                ToggleSnackbar("top", "right", t("deleteAsync"), "success");
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                setLoading(false);
            });
    };

    const deleteBatch =
        (force, unlink = false) =>
        () => {
            setLoading(true);
            API.post("/admin/file/delete", { id: selected, force, unlink })
                .then(() => {
                    loadList();
                    ToggleSnackbar("top", "right", t("deleteAsync"), "success");
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
            const newSelecteds = files.map((n) => n.ID);
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
            <FileFilter
                filter={filter}
                open={filterDialog}
                onClose={() => setFilterDialog(false)}
                setSearch={setSearch}
                setFilter={setFilter}
            />
            <div className={classes.header}>
                <Button
                    color={"primary"}
                    onClick={() => history.push("/admin/file/import")}
                    variant={"contained"}
                    style={{
                        alignSelf: "center",
                    }}
                >
                    {t("import")}
                </Button>
                <div className={classes.headerRight}>
                    <Tooltip title={tDashboard("user.filter")}>
                        <IconButton
                            style={{ marginRight: 8 }}
                            onClick={() => setFilterDialog(true)}
                        >
                            <Badge
                                color="secondary"
                                variant="dot"
                                invisible={
                                    Object.keys(search).length === 0 &&
                                    Object.keys(filter).length === 0
                                }
                            >
                                <FilterList />
                            </Badge>
                        </IconButton>
                    </Tooltip>
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
                        <Tooltip title={tDashboard("policy.delete")}>
                            <IconButton
                                onClick={deleteBatch(false)}
                                disabled={loading}
                                aria-label="delete"
                            >
                                <Delete />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t("forceDelete")}>
                            <IconButton
                                onClick={deleteBatch(true)}
                                disabled={loading}
                                aria-label="delete"
                            >
                                <DeleteForever />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={tDashboard("file.unlink")}>
                            <IconButton
                                disabled={loading}
                                onClick={deleteBatch(true, true)}
                                size={"small"}
                            >
                                <LinkOff />
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
                                            selected.length < files.length
                                        }
                                        checked={
                                            files.length > 0 &&
                                            selected.length === files.length
                                        }
                                        onChange={handleSelectAllClick}
                                        inputProps={{
                                            "aria-label": "select all desserts",
                                        }}
                                    />
                                </TableCell>
                                <TableCell style={{ minWidth: 59 }}>
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
                                <TableCell style={{ minWidth: 250 }}>
                                    <TableSortLabel
                                        active={orderBy[0] === "name"}
                                        direction={orderBy[1]}
                                        onClick={() =>
                                            setOrderBy([
                                                "name",
                                                orderBy[1] === "asc"
                                                    ? "desc"
                                                    : "asc",
                                            ])
                                        }
                                    >
                                        {t("name")}
                                        {orderBy[0] === "name" ? (
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
                                <TableCell
                                    align={"right"}
                                    style={{ minWidth: 70 }}
                                >
                                    <TableSortLabel
                                        active={orderBy[0] === "size"}
                                        direction={orderBy[1]}
                                        onClick={() =>
                                            setOrderBy([
                                                "size",
                                                orderBy[1] === "asc"
                                                    ? "desc"
                                                    : "asc",
                                            ])
                                        }
                                    >
                                        {t("size")}
                                        {orderBy[0] === "size" ? (
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
                                <TableCell style={{ minWidth: 120 }}>
                                    {t("uploader")}
                                </TableCell>
                                <TableCell style={{ minWidth: 150 }}>
                                    {t("createdAt")}
                                </TableCell>
                                <TableCell style={{ minWidth: 100 }}>
                                    {tDashboard("policy.actions")}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {files.map((row) => (
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
                                    <TableCell>
                                        <Link
                                            target={"_blank"}
                                            color="inherit"
                                            href={
                                                "/api/v3/admin/file/preview/" +
                                                row.ID
                                            }
                                        >
                                            {row.Name}
                                            {row.UploadSessionID && (
                                                <Chip
                                                    className={
                                                        classes.disabledBadge
                                                    }
                                                    size="small"
                                                    label={t("uploading")}
                                                />
                                            )}
                                        </Link>
                                    </TableCell>
                                    <TableCell align={"right"}>
                                        {sizeToString(row.Size)}
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            href={
                                                "/admin/user/edit/" + row.UserID
                                            }
                                        >
                                            {users[row.UserID]
                                                ? users[row.UserID].Nick
                                                : t("unknownUploader")}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {formatLocalTime(
                                            row.CreatedAt,
                                            "YYYY-MM-DD H:mm:ss"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip
                                            title={tDashboard("policy.delete")}
                                        >
                                            <IconButton
                                                disabled={loading}
                                                onClick={() =>
                                                    deleteFile(row.ID)
                                                }
                                                size={"small"}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip
                                            title={tDashboard("file.unlink")}
                                        >
                                            <IconButton
                                                disabled={loading}
                                                onClick={() =>
                                                    deleteFile(row.ID, true)
                                                }
                                                size={"small"}
                                            >
                                                <LinkOff />
                                            </IconButton>
                                        </Tooltip>
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
