import React, { Component } from "react";
import { connect } from "react-redux";
import RefreshIcon from "@material-ui/icons/Refresh";
import API from "../../middleware/Api";
import { Button, IconButton, Typography, withStyles } from "@material-ui/core";
import DownloadingCard from "./DownloadingCard";
import FinishedCard from "./FinishedCard";
import RemoteDownloadButton from "../Dial/Aria2";
import Auth from "../../middleware/Auth";
import { toggleSnackbar } from "../../redux/explorer";
import Nothing from "../Placeholder/Nothing";
import { withTranslation } from "react-i18next";

const styles = (theme) => ({
    actions: {
        display: "flex",
    },
    title: {
        marginTop: "20px",
    },
    layout: {
        width: "auto",
        marginTop: "30px",
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
            width: 700,
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
    hide: {
        display: "none",
    },
    loadingAnimation: {
        borderRadius: "6px 6px 0 0",
    },
    shareFix: {
        marginLeft: "20px",
    },
    loadMore: {
        textAlign: "center",
        marginTop: "20px",
        marginBottom: "20px",
    },
    margin: {
        marginTop: theme.spacing(2),
    },
});
const mapStateToProps = () => {
    return {};
};

const mapDispatchToProps = (dispatch) => {
    return {
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
        },
    };
};

class DownloadComponent extends Component {
    page = 0;
    interval = 0;
    previousDownloading = -1;

    state = {
        downloading: [],
        loading: false,
        finishedList: [],
        continue: true,
    };

    componentDidMount = () => {
        this.loadDownloading();
    };

    componentWillUnmount() {
        clearTimeout(this.interval);
    }

    loadDownloading = () => {
        this.setState({
            loading: true,
        });
        API.get("/aria2/downloading")
            .then((response) => {
                this.setState({
                    downloading: response.data,
                    loading: false,
                });
                // 设定自动更新
                clearTimeout(this.interval);
                if (response.data.length > 0) {
                    this.interval = setTimeout(
                        this.loadDownloading,
                        1000 *
                            response.data.reduce(function (prev, current) {
                                return prev.interval < current.interval
                                    ? prev
                                    : current;
                            }).interval
                    );
                }

                // 下载中条目变更时刷新已完成列表
                if (response.data.length !== this.previousDownloading) {
                    this.page = 0;
                    this.setState({
                        finishedList: [],
                        continue: true,
                    });
                    this.loadMore();
                }
                this.previousDownloading = response.data.length;
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
            });
    };

    loadMore = () => {
        this.setState({
            loading: true,
        });
        API.get("/aria2/finished?page=" + ++this.page)
            .then((response) => {
                this.setState({
                    finishedList: [
                        ...this.state.finishedList,
                        ...response.data,
                    ],
                    loading: false,
                    continue: response.data.length >= 10,
                });
            })
            .catch(() => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    this.props.t("download.failedToLoad"),
                    "error"
                );
                this.setState({
                    loading: false,
                });
            });
    };

    render() {
        const { classes, t } = this.props;
        const user = Auth.GetUser();

        return (
            <div className={classes.layout}>
                {user.group.allowRemoteDownload && <RemoteDownloadButton />}
                <Typography
                    color="textSecondary"
                    variant="h4"
                    className={classes.title}
                >
                    {t("download.active")}
                    <IconButton
                        disabled={this.state.loading}
                        onClick={this.loadDownloading}
                    >
                        <RefreshIcon />
                    </IconButton>
                </Typography>
                {this.state.downloading.length === 0 && (
                    <Nothing primary={t("download.activeEmpty")} />
                )}
                {this.state.downloading.map((value, k) => (
                    <DownloadingCard key={k} task={value} />
                ))}
                <Typography
                    color="textSecondary"
                    variant="h4"
                    className={classes.title}
                >
                    {t("download.finished")}
                </Typography>
                <div className={classes.loadMore}>
                    {this.state.finishedList.length === 0 && (
                        <Nothing primary={t("download.finishedEmpty")} />
                    )}
                    {this.state.finishedList.map((value, k) => {
                        if (value.files) {
                            return <FinishedCard key={k} task={value} />;
                        }
                        return null;
                    })}
                    <Button
                        size="large"
                        className={classes.margin}
                        disabled={!this.state.continue}
                        onClick={this.loadMore}
                    >
                        {t("download.loadMore")}
                    </Button>
                </div>
            </div>
        );
    }
}

const Download = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(withTranslation()(DownloadComponent)));

export default Download;
