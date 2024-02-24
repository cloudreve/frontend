import React, { Component } from "react";
import { connect } from "react-redux";
import SdStorage from "@material-ui/icons/SdStorage";
import ShopIcon from "@material-ui/icons/ShoppingCart";
import PackSelect from "./PackSelect";
import SupervisedUserCircle from "@material-ui/icons/SupervisedUserCircle";
import StarIcon from "@material-ui/icons/StarBorder";
import LocalPlay from "@material-ui/icons/LocalPlay";
import API from "../../middleware/Api";

import {
    AppBar,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    Paper,
    Tab,
    Tabs,
    TextField,
    Typography,
    withStyles,
} from "@material-ui/core";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormLabel from "@material-ui/core/FormLabel";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import { AccountBalanceWallet } from "@material-ui/icons";
import { withRouter } from "react-router";
import { toggleSnackbar } from "../../redux/explorer";
import { withTranslation } from "react-i18next";
import PaymentDialog from "./PaymentDialog";

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
    title: {
        marginTop: "30px",
        marginBottom: "30px",
    },
    button: {
        margin: theme.spacing(1),
    },
    action: {
        textAlign: "right",
        marginTop: "20px",
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 70,
        textAlign: "center!important",
    },
    priceShow: {
        color: theme.palette.secondary.main,
        fontSize: "30px",
    },
    cardHeader: {
        backgroundColor:
            theme.palette.type === "dark"
                ? theme.palette.background.default
                : theme.palette.grey[200],
    },
    cardPricing: {
        display: "flex",
        justifyContent: "center",
        alignItems: "baseline",
        marginBottom: theme.spacing(2),
    },
    cardActions: {
        [theme.breakpoints.up("sm")]: {
            paddingBottom: theme.spacing(2),
        },
    },
    redeemContainer: {
        [theme.breakpoints.up("sm")]: {
            marginLeft: "50px",
            marginRight: "50px",
            width: "auto",
        },
        marginTop: "50px",
        marginBottom: "50px",
    },
    doRedeem: {
        textAlign: "right",
    },
    payMethod: {
        marginTop: theme.spacing(4),
        padding: theme.spacing(2),
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

class BuyQuotaCompoment extends Component {
    IntervalId = null;
    constructor(props) {
        super(props);

        const tab = new URLSearchParams(this.props.location.search);
        const index = tab.get("tab");

        this.state = {
            value: index ? parseInt(index) : 0,
            selectedPack: -1,
            selectedGroup: -1,
            times: 1,
            scoreNum: 1,
            loading: false,
            redeemCode: "",
            dialog: null,
            payment: {
                type: "",
                img: "",
            },
            scorePrice: 0,
            redeemInfo: null,
            packs: [],
            groups: [],
            alipay: false,
            payjs: false,
            wechat: false,
            packPayMethod: null,
        };
    }

    componentWillUnmount() {
        window.clearInterval(this.IntervalId);
    }

    componentDidMount() {
        API.get("/vas/product")
            .then((response) => {
                this.setState({
                    packs: response.data.packs,
                    groups: response.data.groups,
                    alipay: response.data.alipay,
                    payjs: response.data.payjs,
                    wechat: response.data.wechat,
                    custom: response.data.custom
                        ? response.data.custom_name
                        : null,
                    scorePrice: response.data.score_price,
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

    confirmRedeem = () => {
        this.setState({
            loading: true,
        });
        API.post("/vas/redeem/" + this.state.redeemCode)
            .then(() => {
                this.setState({
                    loading: false,
                    dialog: "success",
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
    };

    doRedeem = () => {
        if (this.state.redeemCode === "") {
            this.props.toggleSnackbar(
                "top",
                "right",
                this.props.t("vas.pleaseInputGiftCode"),
                "warning"
            );
            return;
        }
        this.setState({
            loading: true,
        });
        API.get("/vas/redeem/" + this.state.redeemCode)
            .then((response) => {
                this.setState({
                    loading: false,
                    dialog: "redeem",
                    redeemInfo: response.data,
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
    };

    buyPack = (packType) => {
        if (packType === "pack" && this.state.selectedPack === -1) {
            this.props.toggleSnackbar(
                "top",
                "right",
                this.props.t("vas.pleaseSelectAStoragePack"),
                "warning"
            );
            return;
        }
        this.setState({
            loading: true,
        });
        API.post("/vas/order", {
            action: packType,
            method: this.state.packPayMethod,
            id:
                packType === "score"
                    ? 1
                    : packType === "pack"
                    ? this.state.packs[this.state.selectedPack].id
                    : this.state.groups[this.state.selectedGroup].id,
            num:
                packType === "score"
                    ? parseInt(this.state.scoreNum)
                    : parseInt(this.state.times),
        })
            .then((response) => {
                if (!response.data.payment) {
                    this.setState({
                        loading: false,
                        dialog: "success",
                    });
                    return;
                }
                if (response.data.qr_code) {
                    this.setState({
                        loading: false,
                        dialog: "qr",
                        payment: {
                            type: this.state.packPayMethod,
                            img: response.data.qr_code,
                        },
                    });
                    this.IntervalId = window.setInterval(() => {
                        this.querryLoop(response.data.id);
                    }, 3000);
                }
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
    };

    querryLoop = (id) => {
        API.get("/vas/order/" + id)
            .then((response) => {
                if (response.data === 1) {
                    this.setState({
                        dialog: "success",
                    });
                    window.clearInterval(this.IntervalId);
                }
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                window.clearInterval(this.IntervalId);
            });
    };

    handleChange = (event, value) => {
        this.setState({
            packPayMethod:
                this.state.packPayMethod === "score"
                    ? null
                    : this.state.packPayMethod,
        });
        this.setState({ value });
    };

    handleChangeIndex = (index) => {
        this.setState({ value: index });
    };

    handleClose = () => {
        window.clearInterval(this.IntervalId);
        this.setState({
            dialog: null,
        });
    };

    handleTexyChange = (name) => (event) => {
        this.setState({ [name]: event.target.value });
    };

    selectPack = (id) => {
        this.setState({
            selectedPack: id,
            packPayMethod:
                this.state.packPayMethod === "score"
                    ? null
                    : this.state.packPayMethod,
        });
    };

    selectGroup = (id) => {
        this.setState({
            selectedGroup: id,
            dialog: "buyGroup",
            packPayMethod:
                this.state.packPayMethod === "score"
                    ? null
                    : this.state.packPayMethod,
        });
    };

    selectPackPayMethod = (event) => {
        this.setState({
            packPayMethod: event.target.value,
        });
    };

    render() {
        const { classes, t } = this.props;

        const methodSelect = (
            <div>
                <FormLabel>{t("vas.selectPaymentMethod")}</FormLabel>
                <RadioGroup
                    name="spacing"
                    aria-label="spacing"
                    value={this.state.packPayMethod}
                    onChange={this.selectPackPayMethod}
                    row
                >
                    {!this.state.alipay &&
                        !this.state.payjs &&
                        this.state.value === 0 &&
                        (this.state.selectedPack === -1 ||
                            this.state.packs[this.state.selectedPack].score ===
                                0) &&
                        this.state.value === 1 &&
                        (this.state.selectedGroup === -1 ||
                            this.state.groups[this.state.selectedGroup]
                                .score === 0) && (
                            <Typography>
                                {t("vas.noAvailableMethod")}
                            </Typography>
                        )}
                    {this.state.alipay && (
                        <FormControlLabel
                            value={"alipay"}
                            control={<Radio />}
                            label={t("vas.alipay")}
                        />
                    )}
                    {this.state.payjs && (
                        <FormControlLabel
                            value={"payjs"}
                            control={<Radio />}
                            label={t("vas.wechatPay")}
                        />
                    )}
                    {this.state.wechat && (
                        <FormControlLabel
                            value={"wechat"}
                            control={<Radio />}
                            label={t("vas.wechatPay")}
                        />
                    )}
                    {this.state.custom && (
                        <FormControlLabel
                            value={"custom"}
                            control={<Radio />}
                            label={this.state.custom}
                        />
                    )}
                    {this.state.value === 0 &&
                        this.state.selectedPack !== -1 &&
                        this.state.packs[this.state.selectedPack].score !==
                            0 && (
                            <FormControlLabel
                                value={"score"}
                                control={<Radio />}
                                label={t("vas.payByCredits")}
                            />
                        )}
                    {this.state.value === 1 &&
                        this.state.selectedGroup !== -1 &&
                        this.state.groups[this.state.selectedGroup].score !==
                            0 && (
                            <FormControlLabel
                                value={"score"}
                                control={<Radio />}
                                label={t("vas.payByCredits")}
                            />
                        )}
                </RadioGroup>
                <div>
                    {this.state.value !== 2 && (
                        <FormLabel>{t("vas.purchaseDuration")}</FormLabel>
                    )}
                    {this.state.value === 2 && (
                        <FormLabel>{t("vas.creditsNum")}</FormLabel>
                    )}
                </div>
                {this.state.value !== 2 && (
                    <TextField
                        className={classes.textField}
                        type="number"
                        inputProps={{
                            min: "1",
                            max: "99",
                            step: "1",
                        }}
                        value={this.state.times}
                        onChange={this.handleTexyChange("times")}
                    />
                )}
                {this.state.value === 2 && (
                    <TextField
                        className={classes.textField}
                        type="number"
                        inputProps={{
                            min: "1",
                            step: "1",
                            max: "9999999",
                        }}
                        value={this.state.scoreNum}
                        onChange={this.handleTexyChange("scoreNum")}
                    />
                )}
            </div>
        );

        return (
            <div className={classes.layout}>
                <Typography
                    color="textSecondary"
                    className={classes.title}
                    variant="h3"
                >
                    {t("vas.store")}
                </Typography>
                <AppBar position="static">
                    <Tabs
                        value={this.state.value}
                        onChange={this.handleChange}
                        variant="fullWidth"
                    >
                        <Tab
                            label={t("vas.storagePacks")}
                            icon={<SdStorage />}
                        />
                        <Tab
                            label={t("vas.membership")}
                            icon={<SupervisedUserCircle />}
                        />
                        {this.state.scorePrice > 0 && (
                            <Tab
                                label={t("vas.buyCredits")}
                                icon={<AccountBalanceWallet />}
                            />
                        )}
                        <Tab
                            label={t("vas.useGiftCode")}
                            icon={<LocalPlay />}
                        />
                    </Tabs>
                </AppBar>
                {this.state.value === 0 && (
                    <Paper className={classes.paper} square={true}>
                        <Grid container spacing={3}>
                            {this.state.packs.map((value, id) => (
                                <Grid item xs={12} md={3} key={id}>
                                    <PackSelect
                                        pack={value}
                                        onSelect={() => this.selectPack(id)}
                                        active={this.state.selectedPack === id}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                        <Grid
                            container
                            className={classes.payMethod}
                            spacing={1}
                        >
                            <Grid sm={6} xs={12}>
                                {methodSelect}
                            </Grid>
                            <Grid sm={6} xs={12}>
                                <div className={classes.action}>
                                    <div>
                                        {t("vas.subtotal")}
                                        {this.state.packPayMethod !==
                                            "score" && (
                                            <span className={classes.priceShow}>
                                                ￥
                                                {this.state.selectedPack ===
                                                    -1 && <span>--</span>}
                                                {this.state.selectedPack !==
                                                    -1 &&
                                                    this.state.times <= 99 &&
                                                    this.state.times >= 1 && (
                                                        <span>
                                                            {(
                                                                (this.state
                                                                    .packs[
                                                                    this.state
                                                                        .selectedPack
                                                                ].price /
                                                                    100) *
                                                                this.state.times
                                                            ).toFixed(2)}
                                                        </span>
                                                    )}
                                            </span>
                                        )}
                                        {this.state.packPayMethod ===
                                            "score" && (
                                            <span className={classes.priceShow}>
                                                {this.state.selectedPack ===
                                                    -1 && <span>--</span>}
                                                {this.state.selectedPack !==
                                                    -1 &&
                                                    this.state.times <= 99 &&
                                                    this.state.times >= 1 && (
                                                        <span>
                                                            {t(
                                                                "vas.creditsTotalNum",
                                                                {
                                                                    num:
                                                                        this
                                                                            .state
                                                                            .packs[
                                                                            this
                                                                                .state
                                                                                .selectedPack
                                                                        ]
                                                                            .score *
                                                                        this
                                                                            .state
                                                                            .times,
                                                                }
                                                            )}
                                                        </span>
                                                    )}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <Button
                                            size="large"
                                            variant="contained"
                                            color="secondary"
                                            className={classes.button}
                                            disabled={
                                                this.state.loading ||
                                                this.state.packPayMethod ===
                                                    null
                                            }
                                            onClick={() => this.buyPack("pack")}
                                        >
                                            <ShopIcon /> {t("vas.checkoutNow")}
                                        </Button>
                                    </div>
                                </div>
                            </Grid>
                        </Grid>
                    </Paper>
                )}
                {this.state.value === 1 && (
                    <Paper className={classes.paper} square={true}>
                        <Grid container spacing={5} alignItems="flex-end">
                            {this.state.groups.map((tier, id) => (
                                // Enterprise card is full width at sm breakpoint
                                <Grid item key={id} xs={12} sm={6} md={4}>
                                    <Card>
                                        <CardHeader
                                            title={tier.name}
                                            subheader={
                                                tier.highlight
                                                    ? t("vas.recommended")
                                                    : null
                                            }
                                            titleTypographyProps={{
                                                align: "center",
                                            }}
                                            subheaderTypographyProps={{
                                                align: "center",
                                            }}
                                            action={
                                                tier.highlight ? (
                                                    <StarIcon />
                                                ) : null
                                            }
                                            className={classes.cardHeader}
                                        />
                                        <CardContent>
                                            <div
                                                className={classes.cardPricing}
                                            >
                                                <Typography
                                                    component="h2"
                                                    variant="h3"
                                                    color="textPrimary"
                                                >
                                                    ￥{tier.price / 100}
                                                </Typography>
                                                <Typography
                                                    variant="h6"
                                                    color="textSecondary"
                                                >
                                                    /
                                                    {t("vas.days", {
                                                        num: Math.ceil(
                                                            tier.time / 86400
                                                        ),
                                                    })}
                                                </Typography>
                                            </div>
                                            {tier.des.map((line) => (
                                                <Typography
                                                    variant="subtitle1"
                                                    align="center"
                                                    key={line}
                                                >
                                                    {line}
                                                </Typography>
                                            ))}
                                        </CardContent>
                                        <CardActions
                                            className={classes.cardActions}
                                        >
                                            <Button
                                                fullWidth
                                                variant={
                                                    tier.highlight
                                                        ? "contained"
                                                        : "outlined"
                                                }
                                                color="primary"
                                                onClick={() =>
                                                    this.selectGroup(id)
                                                }
                                            >
                                                {t("vas.checkoutNow")}
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                )}

                {this.state.value === 2 && (
                    <Paper className={classes.paper} square={true}>
                        <Grid
                            container
                            className={classes.payMethod}
                            spacing={1}
                        >
                            <Grid sm={6} xs={12}>
                                {methodSelect}
                            </Grid>
                            <Grid sm={6} xs={12}>
                                <div className={classes.action}>
                                    <div>
                                        {t("vas.subtotal")}
                                        {this.state.packPayMethod !==
                                            "score" && (
                                            <span className={classes.priceShow}>
                                                ￥
                                                <span>
                                                    {(
                                                        (this.state.scorePrice /
                                                            100) *
                                                        this.state.scoreNum
                                                    ).toFixed(2)}
                                                </span>
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <Button
                                            size="large"
                                            variant="contained"
                                            color="secondary"
                                            className={classes.button}
                                            disabled={
                                                this.state.loading ||
                                                this.state.packPayMethod ===
                                                    null
                                            }
                                            onClick={() =>
                                                this.buyPack("score")
                                            }
                                        >
                                            <ShopIcon /> {t("vas.checkoutNow")}
                                        </Button>
                                    </div>
                                </div>
                            </Grid>
                        </Grid>
                    </Paper>
                )}

                {this.state.value === 3 && (
                    <Paper className={classes.paper} square={true}>
                        <div className={classes.redeemContainer}>
                            <TextField
                                id="standard-name"
                                label={t("vas.enterGiftCode")}
                                value={this.state.redeemCode}
                                onChange={this.handleTexyChange("redeemCode")}
                                margin="normal"
                                inputProps={{
                                    style: { textTransform: "uppercase" },
                                }}
                                fullWidth
                            />
                            <div className={classes.doRedeem}>
                                <Button
                                    size="large"
                                    variant="contained"
                                    color="secondary"
                                    className={classes.button}
                                    disabled={this.state.loading}
                                    onClick={this.doRedeem}
                                >
                                    {t("login.continue")}
                                </Button>
                            </div>
                        </div>
                    </Paper>
                )}
                <PaymentDialog
                    open={this.state.dialog === "qr"}
                    payment={this.state.payment}
                    handleClose={this.handleClose}
                />

                <Dialog
                    open={this.state.dialog === "success"}
                    onClose={this.handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {t("vas.paymentCompleted")}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            {t("vas.productDelivered")}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            {t("close", { ns: "common" })}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={this.state.dialog === "redeem"}
                    onClose={this.handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {t("vas.confirmRedeem")}
                    </DialogTitle>
                    <DialogContent>
                        {this.state.redeemInfo !== null && (
                            <DialogContentText id="alert-dialog-description">
                                <Typography variant="subtitle1">
                                    {t("vas.productName")}
                                </Typography>
                                <Typography>
                                    {this.state.redeemInfo.name}
                                </Typography>
                                <Typography variant="subtitle1">
                                    {this.state.redeemInfo.type === 2
                                        ? t("vas.qyt")
                                        : t("vas.duration")}
                                </Typography>
                                <Typography>
                                    {this.state.redeemInfo.type === 2 && (
                                        <>{this.state.redeemInfo.num}</>
                                    )}
                                    {this.state.redeemInfo.type !== 2 && (
                                        <>
                                            {t("vas.days", {
                                                num:
                                                    Math.ceil(
                                                        this.state.redeemInfo
                                                            .time / 86400
                                                    ) *
                                                    this.state.redeemInfo.num,
                                            })}
                                        </>
                                    )}
                                </Typography>
                            </DialogContentText>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose}>
                            {t("cancel", { ns: "common" })}
                        </Button>
                        <Button
                            onClick={this.confirmRedeem}
                            color="primary"
                            disabled={this.state.loading}
                        >
                            {t("vas.confirmRedeem")}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={this.state.dialog === "buyGroup"}
                    onClose={this.handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {t("vas.subscribe")}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            {t("vas.selected")}
                            {this.state.selectedGroup !== -1 &&
                                this.state.groups[this.state.selectedGroup]
                                    .name}
                        </DialogContentText>
                        {methodSelect}
                        <div>
                            {t("vas.subtotal")}
                            {this.state.packPayMethod !== "score" && (
                                <span className={classes.priceShow}>
                                    ￥
                                    {this.state.selectedGroup === -1 && (
                                        <span>--</span>
                                    )}
                                    {this.state.selectedGroup !== -1 &&
                                        this.state.times <= 99 &&
                                        this.state.times >= 1 && (
                                            <span>
                                                {(
                                                    (this.state.groups[
                                                        this.state.selectedGroup
                                                    ].price /
                                                        100) *
                                                    this.state.times
                                                ).toFixed(2)}
                                            </span>
                                        )}
                                </span>
                            )}
                            {this.state.packPayMethod === "score" && (
                                <span className={classes.priceShow}>
                                    {this.state.selectedGroup === -1 && (
                                        <span>--</span>
                                    )}
                                    {this.state.selectedGroup !== -1 &&
                                        this.state.times <= 99 &&
                                        this.state.times >= 1 && (
                                            <span>
                                                {t("vas.creditsTotalNum", {
                                                    num:
                                                        this.state.groups[
                                                            this.state
                                                                .selectedGroup
                                                        ].score *
                                                        this.state.times,
                                                })}
                                            </span>
                                        )}
                                </span>
                            )}
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={this.handleClose}
                            disabled={this.state.loading}
                        >
                            {t("cancel", { ns: "common" })}
                        </Button>
                        <Button
                            disabled={
                                this.state.loading ||
                                this.state.packPayMethod === null
                            }
                            onClick={() => this.buyPack("group")}
                            color="primary"
                        >
                            {t("vas.checkoutNow")}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

const BuyQuota = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(withRouter(withTranslation()(BuyQuotaCompoment))));

export default BuyQuota;
