import React, { useState, useCallback, useEffect } from "react";
import { makeStyles, Typography } from "@material-ui/core";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../actions";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Button from "@material-ui/core/Button";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Alert from "@material-ui/lab/Alert";
import Auth from "../../middleware/Auth";
import API from "../../middleware/Api";
import IconButton from "@material-ui/core/IconButton";
import { Delete } from "@material-ui/icons";
import CreateWebDAVAccount from "../Modals/CreateWebDAVAccount";
import TimeAgo from "timeago-react";
import CreateWebDAVMount from "../Modals/CreateWebDAVMount";

const useStyles = makeStyles(theme => ({
    layout: {
        width: "auto",
        marginTop: "50px",
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
            width: 1100,
            marginLeft: "auto",
            marginRight: "auto"
        },
        marginBottom: "50px"
    },
    content: {
        marginTop: theme.spacing(4)
    },
    cardContent: {
        padding: theme.spacing(2)
    },
    tableContainer: {
        overflowX: "auto"
    },
    create: {
        marginTop: theme.spacing(2)
    }
}));

export default function WebDAV(props) {
    const [tab, setTab] = useState(0);
    const [create, setCreate] = useState(false);
    const [mount, setMount] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [folders, setFolders] = useState([]);

    useEffect(() => {
        loadList();
    }, []);

    const loadList = () =>{
        API.get("/webdav/accounts")
            .then(response => {
                setAccounts(response.data.accounts);
                setFolders(response.data.folders);
            })
            .catch(error => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    }

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const deleteAccount = id => {
        let account = accounts[id];
        API.delete("/webdav/accounts/" + account.ID)
            .then(response => {
                let accountCopy = [...accounts];
                accountCopy = accountCopy.filter((v, i) => {
                    return i !== id;
                });
                setAccounts(accountCopy);
            })
            .catch(error => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    };

    const deleteMount = id => {
        let folder = folders[id];
        API.delete("/webdav/mount/" + folder.id)
            .then(response => {
                let folderCopy = [...folders];
                folderCopy = folderCopy.filter((v, i) => {
                    return i !== id;
                });
                setFolders(folderCopy);
            })
            .catch(error => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    };

    const addAccount = account => {
        setCreate(false);
        API.post("/webdav/accounts", {
            path: account.path,
            name: account.name
        })
            .then(response => {
                setAccounts([
                    {
                        ID: response.data.id,
                        Password: response.data.password,
                        CreatedAt: response.data.created_at,
                        Name: account.name,
                        Root: account.path
                    },
                    ...accounts
                ]);
            })
            .catch(error => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    };

    const addMount = mountInfo => {
        setMount(false);
        API.post("/webdav/mount", {
            path: mountInfo.path,
            policy: mountInfo.policy
        })
            .then(response => {
                loadList();
            })
            .catch(error => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    };

    const classes = useStyles();
    const user = Auth.GetUser();

    return (
        <div className={classes.layout}>
            <CreateWebDAVAccount
                callback={addAccount}
                open={create}
                onClose={() => setCreate(false)}
            />
            <CreateWebDAVMount
                callback={addMount}
                open={mount}
                onClose={() => setMount(false)}
            />
            <Typography color="textSecondary" variant="h4">
                WebDAV
            </Typography>
            <Paper elevation={3} className={classes.content}>
                <Tabs
                    value={tab}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={(event, newValue) => setTab(newValue)}
                    aria-label="disabled tabs example"
                >
                    <Tab label="账号管理" />
                    <Tab label="存储策略挂载" />
                </Tabs>
                <div className={classes.cardContent}>
                    {tab === 0 && (
                        <div>
                            <Alert severity="info">
                                WebDAV的登陆用户名统一为：{user.user_name}{" "}
                                ；密码为所创建账号的密码。
                            </Alert>
                            <TableContainer className={classes.tableContainer}>
                                <Table
                                    className={classes.table}
                                    aria-label="simple table"
                                >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>账号名称</TableCell>
                                            <TableCell align="right">
                                                密码
                                            </TableCell>
                                            <TableCell align="right">
                                                根目录
                                            </TableCell>
                                            <TableCell align="right">
                                                创建日期
                                            </TableCell>
                                            <TableCell align="right">
                                                操作
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {accounts.map((row, id) => (
                                            <TableRow key={id}>
                                                <TableCell
                                                    component="th"
                                                    scope="row"
                                                >
                                                    {row.Name}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {row.Password}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {row.Root}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <TimeAgo
                                                        datetime={row.CreatedAt}
                                                        locale="zh_CN"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        size={"small"}
                                                        onClick={() =>
                                                            deleteAccount(id)
                                                        }
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Button
                                onClick={() => setCreate(true)}
                                className={classes.create}
                                variant="contained"
                                color="secondary"
                            >
                                创建新账号
                            </Button>
                        </div>
                    )}
                    {tab === 1 && (
                        <div>
                            <Alert severity="info">
                                为目录挂载存储策略后，在 WebDAV 中上传至此目录的新文件将会使用挂载的存储策略存储。复制、移动到此目录不会应用挂载的存储策略；挂载设置不会被子目录继承。
                            </Alert>
                            <TableContainer className={classes.tableContainer}>
                                <Table
                                    size="small"
                                    className={classes.table}
                                    aria-label="simple table"
                                >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>目录名</TableCell>
                                            <TableCell align="right">
                                                挂载存储策略
                                            </TableCell>
                                            <TableCell align="right">
                                                操作
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {folders.map((row, id) => (
                                            <TableRow key={id}>
                                                <TableCell
                                                    component="th"
                                                    scope="row"
                                                >
                                                    {row.name}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {row.policy_name}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        size={"small"}
                                                        onClick={() =>
                                                            deleteMount(id)
                                                        }
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Button
                                onClick={() => setMount(true)}
                                className={classes.create}
                                variant="contained"
                                color="secondary"
                            >
                                挂载新目录
                            </Button>
                        </div>
                    )}
                </div>
            </Paper>
        </div>
    );
}
