import React, { useState, useCallback, useEffect } from "react";
import { makeStyles, Typography } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
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
import Link from "@material-ui/core/Link";
import { toggleSnackbar } from "../../redux/explorer";
import Nothing from "../Placeholder/Nothing";
import { useTranslation } from "react-i18next";
import AppPromotion from "./AppPromotion";
import Tooltip from "@material-ui/core/Tooltip";
import ToggleIcon from "material-ui-toggle-icon";
import { Pencil, PencilOff } from "mdi-material-ui";

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
    copy: {
        marginLeft: 10,
    },
}));

export default function WebDAV() {
    const { t } = useTranslation();
    const [tab, setTab] = useState(0);
    const [create, setCreate] = useState(false);
    const [accounts, setAccounts] = useState([]);

    const appPromotion = useSelector((state) => state.siteConfig.app_promotion);
    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const copyToClipboard = (text) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            ToggleSnackbar("top", "center", t("setting.copied"), "success");
        } else {
            ToggleSnackbar(
                "top",
                "center",
                t("setting.pleaseManuallyCopy"),
                "warning"
            );
        }
    };

    const loadList = () => {
        API.get("/webdav/accounts")
            .then((response) => {
                setAccounts(response.data.accounts);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    };
    useEffect(() => {
        loadList();
        // eslint-disable-next-line
    }, []);

    const deleteAccount = (id) => {
        const account = accounts[id];
        API.delete("/webdav/accounts/" + account.ID)
            .then(() => {
                let accountCopy = [...accounts];
                accountCopy = accountCopy.filter((v, i) => {
                    return i !== id;
                });
                setAccounts(accountCopy);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    };

    const toggleAccountReadonly = (id) => {
        const account = accounts[id];
        API.patch("/webdav/accounts", {
            id: account.ID,
            readonly: !account.Readonly,
        })
            .then((response) => {
                account.Readonly = response.data.readonly;
                const accountCopy = [...accounts];
                setAccounts(accountCopy);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    };

    const addAccount = (account) => {
        setCreate(false);
        API.post("/webdav/accounts", {
            path: account.path,
            name: account.name,
        })
            .then((response) => {
                setAccounts([
                    {
                        ID: response.data.id,
                        Password: response.data.password,
                        CreatedAt: response.data.created_at,
                        Name: account.name,
                        Root: account.path,
                        Readonly: account.Readonly,
                    },
                    ...accounts,
                ]);
            })
            .catch((error) => {
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
            <Typography color="textSecondary" variant="h4">
                {t("navbar.connect")}
            </Typography>
            <Paper elevation={3} className={classes.content}>
                <Tabs
                    value={tab}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={(event, newValue) => setTab(newValue)}
                    aria-label="disabled tabs example"
                >
                    <Tab label={t("setting.webdavAccounts")} />
                    {appPromotion && <Tab label={t("setting.iOSApp")} />}
                </Tabs>
                <div className={classes.cardContent}>
                    {tab === 0 && (
                        <div>
                            <Alert severity="info">
                                {t("setting.webdavHint", {
                                    url: window.location.origin + "/dav",
                                    name: user.user_name,
                                })}
                            </Alert>
                            <TableContainer className={classes.tableContainer}>
                                <Table
                                    className={classes.table}
                                    aria-label="simple table"
                                >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>
                                                {t("setting.annotation")}
                                            </TableCell>
                                            <TableCell>
                                                {t("login.password")}
                                            </TableCell>
                                            <TableCell align="right">
                                                {t("setting.rootFolder")}
                                            </TableCell>
                                            <TableCell align="right">
                                                {t("setting.createdAt")}
                                            </TableCell>
                                            <TableCell align="center">
                                                {t("setting.action")}
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
                                                <TableCell>
                                                    {row.Password}
                                                    <Link
                                                        className={classes.copy}
                                                        onClick={() =>
                                                            copyToClipboard(
                                                                row.Password
                                                            )
                                                        }
                                                        href={"javascript:void"}
                                                    >
                                                        {t("copyToClipboard", {
                                                            ns: "common",
                                                        })}
                                                    </Link>
                                                </TableCell>
                                                <TableCell align="right">
                                                    {row.Root}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <TimeAgo
                                                        datetime={row.CreatedAt}
                                                        locale={t(
                                                            "timeAgoLocaleCode",
                                                            {
                                                                ns: "common",
                                                            }
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Tooltip
                                                        placement="top"
                                                        title={
                                                            row.Readonly
                                                                ? t(
                                                                      "setting.readonlyOff"
                                                                  )
                                                                : t(
                                                                      "setting.readonlyOn"
                                                                  )
                                                        }
                                                        onClick={() =>
                                                            toggleAccountReadonly(
                                                                id
                                                            )
                                                        }
                                                    >
                                                        <IconButton>
                                                            <ToggleIcon
                                                                on={
                                                                    row.Readonly
                                                                }
                                                                onIcon={
                                                                    <PencilOff
                                                                        fontSize={
                                                                            "small"
                                                                        }
                                                                    />
                                                                }
                                                                offIcon={
                                                                    <Pencil
                                                                        fontSize={
                                                                            "small"
                                                                        }
                                                                    />
                                                                }
                                                            />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip
                                                        placement="top"
                                                        title={t(
                                                            "setting.delete"
                                                        )}
                                                        onClick={() =>
                                                            deleteAccount(id)
                                                        }
                                                    >
                                                        <IconButton
                                                            fontSize={"small"}
                                                        >
                                                            <Delete />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {accounts.length === 0 && (
                                    <Nothing primary={t("setting.listEmpty")} />
                                )}
                            </TableContainer>
                            <Button
                                onClick={() => setCreate(true)}
                                className={classes.create}
                                variant="contained"
                                color="secondary"
                            >
                                {t("setting.createNewAccount")}
                            </Button>
                        </div>
                    )}
                    {tab === 1 && <AppPromotion />}
                </div>
            </Paper>
        </div>
    );
}
