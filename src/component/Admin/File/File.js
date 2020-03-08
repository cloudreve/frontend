import React, { useCallback, useEffect, useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import API from "../../../middleware/Api";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../../actions";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import { sizeToString } from "../../../untils";
import TableBody from "@material-ui/core/TableBody";
import { policyTypeMap } from "../../../config";
import TablePagination from "@material-ui/core/TablePagination";
import AddPolicy from "../Dialogs/AddPolicy";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { useHistory, useLocation } from "react-router";
import IconButton from "@material-ui/core/IconButton";
import {Block, Delete, Edit, FilterList} from "@material-ui/icons";
import Tooltip from "@material-ui/core/Tooltip";
import Popover from "@material-ui/core/Popover";
import Menu from "@material-ui/core/Menu";
import Checkbox from "@material-ui/core/Checkbox";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { lighten } from "@material-ui/core";
import Link from "@material-ui/core/Link";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import UserFilter from "../Dialogs/UserFilter";
import Badge from "@material-ui/core/Badge";

const useStyles = makeStyles(theme => ({
    root: {
        [theme.breakpoints.up("md")]: {
            marginLeft: 100
        },
        marginBottom: 40
    },
    content: {
        padding: theme.spacing(2)
    },
    container: {
        overflowX: "auto"
    },
    tableContainer: {
        marginTop: 16
    },
    header: {
        display: "flex",
        justifyContent: "space-between"
    },
    headerRight: {},
    highlight:
        theme.palette.type === "light"
            ? {
                  color: theme.palette.secondary.main,
                  backgroundColor: lighten(theme.palette.secondary.light, 0.85)
              }
            : {
                  color: theme.palette.text.primary,
                  backgroundColor: theme.palette.secondary.dark
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
        width: 1
    }
}));

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function File() {
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
    const [loading,setLoading] = useState(false);

    let history = useHistory();
    let theme = useTheme();

    useEffect(() => {
        loadList();
    }, [page, pageSize, orderBy, filter, search]);

    const loadList = () => {
        API.post("/admin/file/list", {
            page: page,
            page_size: pageSize,
            order_by: orderBy.join(" "),
            conditions: filter,
            searches: search
        })
            .then(response => {
                setFiles(response.data.items);
                setTotal(response.data.total);
                setSelected([]);
                setUsers(response.data.users);
            })
            .catch(error => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    };

    const deletePolicy = id => {
        setLoading(true);
        API.post("/admin/file/delete",{id:[id]})
            .then(response => {
                loadList();
                ToggleSnackbar("top", "right", "文件已删除", "success");
            })
            .catch(error => {
                ToggleSnackbar("top", "right", error.message, "error");
            }).finally(()=>{
            setLoading(false);
        });
    };

    const deleteBatch = e =>{
        setLoading(true);
        API.post("/admin/file/delete",{id:selected})
            .then(response => {
                loadList();
                ToggleSnackbar("top", "right", "文件已删除", "success");
            })
            .catch(error => {
                ToggleSnackbar("top", "right", error.message, "error");
            }).finally(()=>{
            setLoading(false);
        });
    }

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const handleSelectAllClick = event => {
        if (event.target.checked) {
            const newSelecteds = files.map(n => n.ID);
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

    const isSelected = id => selected.indexOf(id) !== -1;

    return (
        <div>
            <UserFilter
                filter={filter}
                open={filterDialog}
                onClose={() => setFilterDialog(false)}
                setSearch={setSearch}
                setFilter={setFilter}
            />
            <div className={classes.header}>
                <div className={classes.headerRight}>
                    <Tooltip title="过滤">

                            <IconButton
                                style={{ marginRight: 8 }}
                                onClick={() => setFilterDialog(true)}
                            ><Badge
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
                        刷新
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
                            已选择 {selected.length} 个对象
                        </Typography>
                        <Tooltip title="删除">
                            <IconButton onClick={deleteBatch} disabled={loading} aria-label="delete">
                                <Delete />
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
                                            "aria-label": "select all desserts"
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
                                                    : "asc"
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
                                                    : "asc"
                                            ])
                                        }
                                    >
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
                                <TableCell align={"right"} style={{ minWidth: 70 }}>
                                    <TableSortLabel
                                        active={orderBy[0] === "size"}
                                        direction={orderBy[1]}
                                        onClick={() =>
                                            setOrderBy([
                                                "size",
                                                orderBy[1] === "asc"
                                                    ? "desc"
                                                    : "asc"
                                            ])
                                        }
                                    >
                                        大小
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
                                    上传者
                                </TableCell>
                                <TableCell style={{ minWidth: 150 }}>
                                    上传于
                                </TableCell>
                                <TableCell
                                    style={{ minWidth: 100 }}
                                >
                                    操作
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {files.map(row => (
                                <TableRow
                                    hover
                                    key={row.ID}
                                    role="checkbox"
                                    selected={isSelected(row.ID)}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            onClick={event =>
                                                handleClick(event, row.ID)
                                            }
                                            checked={isSelected(row.ID)}
                                        />
                                    </TableCell>
                                    <TableCell>{row.ID}</TableCell>
                                    <TableCell>
                                        <Link target={"_blank"} color="inherit" href={"/api/v3/admin/file/preview/" + row.ID}>{row.Name}</Link>
                                    </TableCell>
                                    <TableCell align={"right"}>
                                        {sizeToString(row.Size)}
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            href={
                                                "/#/admin/user/edit/" +
                                                row.UserID
                                            }
                                        >
                                            {users[row.UserID]?users[row.UserID].Nick:"未知"}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {row.CreatedAt}
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title={"删除"}>
                                            <IconButton
                                                disabled={loading}
                                                onClick={() =>
                                                    deletePolicy(row.ID)
                                                }
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
                    rowsPerPageOptions={[10, 25,50, 100]}
                    component="div"
                    count={total}
                    rowsPerPage={pageSize}
                    page={page - 1}
                    onChangePage={(e, p) => setPage(p + 1)}
                    onChangeRowsPerPage={e => {
                        setPageSize(e.target.value);
                        setPage(1);
                    }}
                />
            </Paper>
        </div>
    );
}
