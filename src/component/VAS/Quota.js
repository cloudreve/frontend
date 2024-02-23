import React, { Component } from "react";
import { connect } from "react-redux";
import classNames from "classnames";
import API from "../../middleware/Api";

import {
    Button,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    withStyles,
} from "@material-ui/core";
import { sizeToString } from "../../utils";
import { withRouter } from "react-router";
import { formatLocalTime } from "../../utils/datetime";
import { toggleSnackbar } from "../../redux/explorer";
import Nothing from "../Placeholder/Nothing";
import { withTranslation } from "react-i18next";

const styles = (theme) => ({
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

    gird: {
        marginTop: "30px",
    },
    paper: {
        padding: theme.spacing(2),
        color: theme.palette.text.secondary,
    },
    data: {
        fontSize: "25px",
        color: theme.palette.primary.main,
    },
    proBar: {
        height: "10px",
    },
    r1: {
        backgroundColor: "#f0ad4e",
        transition: "width .6s ease",
        height: "100%",
        fontSize: "12px",
        lineHeight: "20px",
        float: "left",
    },
    r2: {
        backgroundColor: "#4caf50",
        transition: "width .6s ease",
        height: "100%",
        fontSize: "12px",
        lineHeight: "20px",
        float: "left",
    },
    r3: {
        backgroundColor: "#5bc0de",
        transition: "width .6s ease",
        height: "100%",
        fontSize: "12px",
        lineHeight: "20px",
        float: "left",
    },
    note_block: {
        width: "10px",
        height: "10px",
        display: "inline-block",
        position: "relative",
        marginLeft: "10px",
        marginRight: "3px",
    },
    r1_block: {
        backgroundColor: "#f0ad4e",
    },
    r2_block: {
        backgroundColor: "#4caf50",
    },
    r3_block: {
        backgroundColor: "#5bc0de",
    },
    title: {
        marginTop: "30px",
        marginBottom: "30px",
    },
    button: {
        margin: theme.spacing(1),
    },
    table: {
        overflowX: "auto",
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

class QuotaCompoment extends Component {
    state = {
        data: {
            basic: 0,
            used: 0,
            total: 0,
            pack: 0,
            r1: 0,
            r2: 0,
            r3: 0,
        },
        packs: [],
    };

    firstLoad = true;

    componentDidMount() {
        if (this.firstLoad) {
            this.firstLoad = !this.firstLoad;
            API.get("/vas/pack")
                .then((response) => {
                    let usedR,
                        baseR,
                        packR = 0;
                    if (response.data.used > response.data.base) {
                        usedR = response.data.used / response.data.total;
                        baseR = 0;
                        packR = 1 - usedR;
                    } else {
                        usedR = response.data.used / response.data.total;
                        baseR =
                            (response.data.base - response.data.used) /
                            response.data.total;
                        packR = 1 - usedR - baseR;
                    }

                    this.setState({
                        data: {
                            used: response.data.used,
                            pack: response.data.pack,
                            total: response.data.total,
                            basic: response.data.base,
                            r1: usedR > 1 ? 100 : usedR * 100,
                            r2: usedR > 1 ? 0 : baseR * 100,
                            r3: usedR > 1 ? 0 : packR * 100,
                        },
                        packs: response.data.packs,
                    });
                })
                .catch((error) => {
                    this.setState({
                        loading: false,
                    });
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        error.message,
                        "error"
                    );
                });
        }
    }
    render() {
        const { classes, t } = this.props;

        return (
            <div className={classes.layout}>
                <Typography color="textSecondary" variant="h4">
                    {t("vas.quota")}
                </Typography>
                <Grid container className={classes.gird} spacing={2}>
                    <Grid item xs={12} sm={3}>
                        <Paper className={classes.paper}>
                            <Typography className={classes.data}>
                                {sizeToString(this.state.data.basic)}
                            </Typography>
                            <Typography>{t("vas.groupBaseQuota")}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Paper className={classes.paper}>
                            <Typography className={classes.data}>
                                {sizeToString(this.state.data.pack)}
                            </Typography>
                            <Typography>{t("vas.validPackQuota")}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Paper className={classes.paper}>
                            <Typography className={classes.data}>
                                {sizeToString(this.state.data.used)}
                            </Typography>
                            <Typography>{t("vas.used")}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Paper className={classes.paper}>
                            <Typography className={classes.data}>
                                {sizeToString(this.state.data.total)}
                            </Typography>
                            <Typography>{t("vas.total")}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper className={classes.paper}>
                            <div className={classes.proBar}>
                                <div
                                    className={classes.r1}
                                    style={{ width: this.state.data.r1 + "%" }}
                                />
                                <div
                                    className={classes.r2}
                                    style={{ width: this.state.data.r2 + "%" }}
                                />
                                <div
                                    className={classes.r3}
                                    style={{ width: this.state.data.r3 + "%" }}
                                />
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <span
                                    className={classNames(
                                        classes.r1_block,
                                        classes.note_block
                                    )}
                                />
                                {t("vas.used")}
                                <span
                                    className={classNames(
                                        classes.r2_block,
                                        classes.note_block
                                    )}
                                />
                                {t("vas.groupBaseQuota")}
                                <span
                                    className={classNames(
                                        classes.r3_block,
                                        classes.note_block
                                    )}
                                />
                                {t("vas.validPackQuota")}
                            </div>
                        </Paper>
                    </Grid>
                </Grid>
                <Typography
                    color="textSecondary"
                    variant="h4"
                    className={classes.title}
                >
                    {t("vas.validStoragePack")}
                </Typography>
                <Paper className={classes.paper}>
                    <Button
                        variant="contained"
                        color="secondary"
                        className={classes.button}
                        onClick={() => this.props.history.push("/buy")}
                    >
                        {t("vas.buyStoragePack")}
                    </Button>
                    <Button
                        variant="contained"
                        className={classes.button}
                        onClick={() => this.props.history.push("/buy?tab=3")}
                    >
                        {t("vas.useGiftCode")}
                    </Button>
                    <div className={classes.table}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left">
                                        {t("vas.packName")}
                                    </TableCell>
                                    <TableCell align="center">
                                        {t("fileManager.size")}
                                    </TableCell>
                                    <TableCell align="center">
                                        {t("vas.activationDate")}
                                    </TableCell>
                                    <TableCell align="center">
                                        {t("vas.validDuration")}
                                    </TableCell>
                                    <TableCell align="center">
                                        {t("vas.expiredAt")}
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.state.packs.map((row, id) => (
                                    <TableRow key={id}>
                                        <TableCell component="th" scope="row">
                                            {row.name}
                                        </TableCell>
                                        <TableCell align="center">
                                            {sizeToString(row.size)}
                                        </TableCell>
                                        <TableCell align="center">
                                            {formatLocalTime(row.activate_date)}
                                        </TableCell>
                                        <TableCell align="center">
                                            {t("vas.days", {
                                                num: Math.round(
                                                    row.expiration / 86400
                                                ),
                                            })}
                                        </TableCell>
                                        <TableCell align="center">
                                            {formatLocalTime(
                                                row.expiration_date
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {this.state.packs.length === 0 && (
                            <Nothing primary={t("setting.listEmpty")} />
                        )}
                    </div>
                </Paper>
            </div>
        );
    }
}

const Quota = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(withRouter(withTranslation()(QuotaCompoment))));

export default Quota;
