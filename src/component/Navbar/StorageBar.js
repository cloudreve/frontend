import React, { Component } from "react";
import PropTypes from "prop-types";
import StorageIcon from "@material-ui/icons/Storage";
import { connect } from "react-redux";
import API from "../../middleware/Api";
import { sizeToString } from "../../utils";

import {
    Divider,
    LinearProgress,
    Tooltip,
    Typography,
    withStyles,
} from "@material-ui/core";
import ButtonBase from "@material-ui/core/ButtonBase";
import Link from "@material-ui/core/Link";
import { withRouter } from "react-router";
import { toggleSnackbar } from "../../redux/explorer";
import { Link as RouterLink } from "react-router-dom";
import { withTranslation } from "react-i18next";

const mapStateToProps = (state) => {
    return {
        refresh: state.viewUpdate.storageRefresh,
        isLogin: state.viewUpdate.isLogin,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
        },
    };
};

const styles = (theme) => ({
    iconFix: {
        marginLeft: "32px",
        marginRight: "17px",
        color: theme.palette.text.secondary,
        marginTop: "2px",
    },
    textFix: {
        padding: " 0 0 0 16px",
    },
    storageContainer: {
        display: "flex",
        marginTop: "15px",
        textAlign: "left",
        marginBottom: "11px",
    },
    detail: {
        width: "100%",
        marginRight: "35px",
    },
    info: {
        width: "131px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        [theme.breakpoints.down("xs")]: {
            width: "162px",
        },
        marginTop: "5px",
    },
    bar: {
        marginTop: "5px",
    },
    stickFooter: {
        backgroundColor: theme.palette.background.paper,
    },
});

// TODO 使用 hooks 重构
class StorageBarCompoment extends Component {
    state = {
        percent: 0,
        used: null,
        total: null,
        showExpand: false,
    };

    firstLoad = true;

    componentDidMount = () => {
        if (this.firstLoad && this.props.isLogin) {
            this.firstLoad = !this.firstLoad;
            this.updateStatus();
        }
    };

    componentWillUnmount() {
        this.firstLoad = false;
    }

    UNSAFE_componentWillReceiveProps = (nextProps) => {
        if (
            (this.props.isLogin && this.props.refresh !== nextProps.refresh) ||
            (this.props.isLogin !== nextProps.isLogin && nextProps.isLogin)
        ) {
            this.updateStatus();
        }
    };

    updateStatus = () => {
        let percent = 0;
        API.get("/user/storage")
            .then((response) => {
                if (response.data.used / response.data.total >= 1) {
                    percent = 100;
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        this.props.t("vas.exceedQuota"),
                        "warning"
                    );
                } else {
                    percent = (response.data.used / response.data.total) * 100;
                }
                this.setState({
                    percent: percent,
                    used: sizeToString(response.data.used),
                    total: sizeToString(response.data.total),
                });
            })
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            .catch(() => {});
    };

    render() {
        const { classes, t } = this.props;
        return (
            <div
                onMouseEnter={() => this.setState({ showExpand: true })}
                onMouseLeave={() => this.setState({ showExpand: false })}
                className={classes.stickFooter}
            >
                <Divider />
                <ButtonBase onClick={() => this.props.history.push("/quota")}>
                    <div className={classes.storageContainer}>
                        <StorageIcon className={classes.iconFix} />
                        <div className={classes.detail}>
                            <Typography variant={"subtitle2"}>
                                {t("navbar.storage") + " "}
                                {this.state.showExpand && (
                                    <Link
                                        component={RouterLink}
                                        color={"secondary"}
                                        to={"/buy"}
                                    >
                                        {t("vas.extendStorage")}
                                    </Link>
                                )}
                            </Typography>

                            <LinearProgress
                                className={classes.bar}
                                color="secondary"
                                variant="determinate"
                                value={this.state.percent}
                            />
                            <div className={classes.info}>
                                <Tooltip
                                    title={t("navbar.storageDetail", {
                                        used:
                                            this.state.used === null
                                                ? " -- "
                                                : this.state.used,
                                        total:
                                            this.state.total === null
                                                ? " -- "
                                                : this.state.total,
                                    })}
                                    placement="top"
                                >
                                    <Typography
                                        variant="caption"
                                        noWrap
                                        color="textSecondary"
                                    >
                                        {this.state.used === null
                                            ? " -- "
                                            : this.state.used}
                                        {" / "}
                                        {this.state.total === null
                                            ? " -- "
                                            : this.state.total}
                                    </Typography>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </ButtonBase>
            </div>
        );
    }
}

StorageBarCompoment.propTypes = {
    classes: PropTypes.object.isRequired,
};

const StorageBar = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(withRouter(withTranslation()(StorageBarCompoment))));

export default StorageBar;
