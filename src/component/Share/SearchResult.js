import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import OpenIcon from "@material-ui/icons/OpenInNew";
import Pagination from "@material-ui/lab/Pagination";
import FolderIcon from "@material-ui/icons/Folder";

import {
    Avatar,
    Card,
    CardHeader,
    Grid,
    IconButton,
    Tooltip,
    Typography,
} from "@material-ui/core";
import API from "../../middleware/Api";
import TypeIcon from "../FileManager/TypeIcon";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { useLocation } from "react-router";
import TimeAgo from "timeago-react";
import { toggleSnackbar } from "../../redux/explorer";
import Nothing from "../Placeholder/Nothing";
import { Trans, useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
    cardContainer: {
        padding: theme.spacing(1),
    },
    card: {
        maxWidth: 400,
        margin: "0 auto",
    },
    actions: {
        display: "flex",
    },
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
    },
    shareTitle: {
        maxWidth: "200px",
    },
    avatarFile: {
        backgroundColor: theme.palette.primary.light,
    },
    avatarFolder: {
        backgroundColor: theme.palette.secondary.light,
    },
    gird: {
        marginTop: "30px",
    },
    loadMore: {
        textAlign: "right",
        marginTop: "20px",
        marginBottom: "40px",
    },
    badge: {
        marginLeft: theme.spacing(1),
        height: 17,
    },
    orderSelect: {
        textAlign: "right",
        marginTop: 5,
    },
    cardAction: {
        marginTop: 0,
    },
}));

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function SearchResult() {
    const { t } = useTranslation("application", { keyPrefix: "share" });
    const { t: tGlobal } = useTranslation();
    const classes = useStyles();
    const dispatch = useDispatch();

    const query = useQuery();
    const location = useLocation();
    const history = useHistory();

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [shareList, setShareList] = useState([]);
    const [orderBy, setOrderBy] = useState("created_at DESC");

    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const search = (keywords, page, orderBy) => {
        const order = orderBy.split(" ");
        API.get(
            "/share/search?page=" +
                page +
                "&order_by=" +
                order[0] +
                "&order=" +
                order[1] +
                "&keywords=" +
                encodeURIComponent(keywords)
        )
            .then((response) => {
                setTotal(response.data.total);
                setShareList(response.data.items);
            })
            .catch(() => {
                ToggleSnackbar("top", "right", t("listLoadingError"), "error");
            });
    };

    useEffect(() => {
        const keywords = query.get("keywords");
        if (keywords) {
            search(keywords, page, orderBy);
        } else {
            ToggleSnackbar("top", "right", t("enterKeywords"), "warning");
        }
    }, [location]);

    const handlePageChange = (event, value) => {
        setPage(value);
        const keywords = query.get("keywords");
        search(keywords, value, orderBy);
    };

    const handleOrderChange = (event) => {
        setOrderBy(event.target.value);
        const keywords = query.get("keywords");
        search(keywords, page, event.target.value);
    };

    return (
        <div className={classes.layout}>
            <Grid container>
                <Grid sm={6} xs={6}>
                    <Typography color="textSecondary" variant="h4">
                        {t("searchResult")}
                    </Typography>
                </Grid>
                <Grid sm={6} xs={6} className={classes.orderSelect}>
                    <FormControl>
                        <Select
                            color={"secondary"}
                            onChange={handleOrderChange}
                            value={orderBy}
                        >
                            <MenuItem value={"created_at DESC"}>
                                {t("createdAtDesc")}
                            </MenuItem>
                            <MenuItem value={"created_at ASC"}>
                                {t("createdAtAsc")}
                            </MenuItem>
                            <MenuItem value={"downloads DESC"}>
                                {t("downloadsDesc")}
                            </MenuItem>
                            <MenuItem value={"downloads ASC"}>
                                {t("downloadsAsc")}
                            </MenuItem>
                            <MenuItem value={"views DESC"}>
                                {t("viewsDesc")}
                            </MenuItem>
                            <MenuItem value={"views ASC"}>
                                {t("viewsAsc")}
                            </MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            <Grid container spacing={24} className={classes.gird}>
                {shareList.length === 0 && <Nothing primary={t("noRecords")} />}
                {shareList.map((value) => (
                    <Grid
                        item
                        xs={12}
                        sm={4}
                        key={value.id}
                        className={classes.cardContainer}
                    >
                        <Card className={classes.card}>
                            <CardHeader
                                classes={{
                                    action: classes.cardAction,
                                }}
                                avatar={
                                    <div>
                                        {!value.is_dir && (
                                            <TypeIcon
                                                fileName={
                                                    value.source
                                                        ? value.source.name
                                                        : ""
                                                }
                                                isUpload
                                            />
                                        )}{" "}
                                        {value.is_dir && (
                                            <Avatar
                                                className={classes.avatarFolder}
                                            >
                                                <FolderIcon />
                                            </Avatar>
                                        )}
                                    </div>
                                }
                                action={
                                    <Tooltip
                                        placement="top"
                                        title={tGlobal("fileManager.open")}
                                    >
                                        <IconButton
                                            onClick={() =>
                                                history.push("/s/" + value.key)
                                            }
                                        >
                                            <OpenIcon />
                                        </IconButton>
                                    </Tooltip>
                                }
                                title={
                                    <Tooltip
                                        placement="top"
                                        title={
                                            value.source
                                                ? value.source.name
                                                : t("sourceNotFound")
                                        }
                                    >
                                        <Typography
                                            noWrap
                                            className={classes.shareTitle}
                                        >
                                            {value.source
                                                ? value.source.name
                                                : t("sourceNotFound")}
                                        </Typography>
                                    </Tooltip>
                                }
                                subheader={
                                    <span>
                                        <Trans
                                            i18nKey="share.sharedAt"
                                            components={[
                                                <TimeAgo
                                                    key={0}
                                                    datetime={value.create_date}
                                                    locale={tGlobal(
                                                        "timeAgoLocaleCode",
                                                        {
                                                            ns: "common",
                                                        }
                                                    )}
                                                />,
                                            ]}
                                        />
                                    </span>
                                }
                            />
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <div className={classes.loadMore}>
                <Pagination
                    count={Math.ceil(total / 18)}
                    onChange={handlePageChange}
                    color="secondary"
                />
            </div>{" "}
        </div>
    );
}
