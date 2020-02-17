import React, { Component } from "react";
import { connect } from "react-redux";
import { toggleSnackbar } from "../../actions";
import SdStorage from "@material-ui/icons/SdStorage";
import ShopIcon from "@material-ui/icons/ShoppingCart";
import axios from "axios";
import PackSelect from "./PackSelect";
import SupervisedUserCircle from "@material-ui/icons/SupervisedUserCircle";
import StarIcon from "@material-ui/icons/StarBorder";
import LocalPlay from "@material-ui/icons/LocalPlay";
import API from "../../middleware/Api";

import {
    withStyles,
    AppBar,
    Tabs,
    Tab,
    Typography,
    Paper,
    Button,
    TextField,
    Grid,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Card,
    CardActions,
    CardContent,
    CardHeader
} from "@material-ui/core";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormLabel from "@material-ui/core/FormLabel";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import Divider from "@material-ui/core/Divider";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import {AccountBalanceWallet} from "@material-ui/icons";

const styles = theme => ({
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

    gird: {
        marginTop: "30px"
    },
    paper: {
        padding: theme.spacing(2),
        color: theme.palette.text.secondary
    },
    title: {
        marginTop: "30px",
        marginBottom: "30px"
    },
    button: {
        margin: theme.spacing(1)
    },
    action: {
        textAlign: "right",
        marginTop: "20px"
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 70,
        textAlign: "center!important"
    },
    priceShow: {
        color: theme.palette.secondary.main,
        fontSize: "30px"
    },
    codeContainer: {
        textAlign: "center",
        marginTop: "20px"
    },
    cardHeader: {
        backgroundColor: theme.palette.grey[200]
    },
    cardPricing: {
        display: "flex",
        justifyContent: "center",
        alignItems: "baseline",
        marginBottom: theme.spacing(2)
    },
    cardActions: {
        [theme.breakpoints.up("sm")]: {
            paddingBottom: theme.spacing(2)
        }
    },
    redeemContainer: {
        [theme.breakpoints.up("sm")]: {
            marginLeft: "50px",
            marginRight: "50px",
            width: "auto"
        },
        marginTop: "50px",
        marginBottom: "50px"
    },
    doRedeem: {
        textAlign: "right"
    },
    payMethod: {
        marginTop: theme.spacing(4),
        padding: theme.spacing(2)
    }
});
const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = dispatch => {
    return {
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
        }
    };
};

class BuyQuotaCompoment extends Component {
    IntervalId = null;
    firstLoad = true;

    constructor(props) {
        super(props);
        this.state = {
            value: 0,
            selectedPack: -1,
            selectedGroup: -1,
            times: 1,
            scoreNum:1,
            loading: false,
            redeemCode: "",
            dialog: null,
            payment: {
                type: "",
                img: "",
            },
            scorePrice:0,
            redeemInfo: null,
            packs: [],
            groups: [],
            alipay: false,
            payjs: false,
            packPayMethod: null
        };
    }

    componentDidMount() {
        API.get("/vas/product")
            .then(response => {
                this.setState({
                    packs: response.data.packs,
                    groups: response.data.groups,
                    alipay: response.data.alipay,
                    payjs: response.data.payjs,
                    scorePrice:response.data.score_price,
                });
            })
            .catch(error => {
                this.setState({
                    loading: false
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
            loading: true
        });
        API
            .post("/vas/redeem/" + this.state.redeemCode,)
            .then(response => {

                    this.setState({
                        loading: false,
                        dialog: "success"
                    });

            })
            .catch(error => {
                this.setState({
                    loading: false
                });
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    "错误：" + error.message,
                    "error"
                );
            });
    };

    doRedeem = () => {
        if (this.state.redeemCode === "") {
            this.props.toggleSnackbar(
                "top",
                "right",
                "请输入激活码",
                "warning"
            );
            return;
        }
        this.setState({
            loading: true
        });
        API
            .get("/vas/redeem/" + this.state.redeemCode,)
            .then(response => {
                this.setState({
                    loading: false,
                    dialog: "redeem",
                    redeemInfo: response.data
                });
            })
            .catch(error => {
                this.setState({
                    loading: false
                });
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
            });
    };

    buyPack = packType => {
        if (packType === "pack" && this.state.selectedPack === -1) {
            this.props.toggleSnackbar(
                "top",
                "right",
                "请先选择一个容量包",
                "warning"
            );
            return;
        }
        this.setState({
            loading: true
        });
        API.post("/vas/order", {
            action: packType,
            method: this.state.packPayMethod,
            id:packType === "score" ? 1 :(packType === "pack"
                ? this.state.packs[this.state.selectedPack].id
                : this.state.groups[this.state.selectedGroup].id)
                ,
            num: packType === "score" ?parseInt(this.state.scoreNum) :parseInt(this.state.times)
        })
            .then(response => {
                if (!response.data.payment) {
                    this.setState({
                        loading: false,
                        dialog: "success"
                    });
                    return;
                }
                // if (response.data.error === 1) {
                //     this.setState({
                //         loading: false
                //     });
                //     this.props.toggleSnackbar(
                //         "top",
                //         "right",
                //         response.data.msg,
                //         "warning"
                //     );
                // } else if (response.data.error === 200) {
                //     this.setState({
                //         loading: false,
                //         dialog: "qr",
                //         payment: {
                //             type: "alipay",
                //             img: response.data.qrcode
                //         }
                //     });
                //     this.IntervalId = window.setInterval(() => {
                //         this.querryLoop(response.data.id);
                //     }, 3000);
                // } else if (response.data.error === 201) {
                //     this.setState({
                //         loading: false,
                //         dialog: "qr",
                //         payment: {
                //             type: "youzan",
                //             img: response.data.qrcode
                //         }
                //     });
                //     this.IntervalId = window.setInterval(() => {
                //         this.querryLoop(response.data.id);
                //     }, 3000);
                // }
            })
            .catch(error => {
                this.setState({
                    loading: false
                });
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    "错误：" + error.message,
                    "error"
                );
            });
    };

    querryLoop = id => {
        axios
            .get("/Buy/querryStatus?id=" + id)
            .then(response => {
                var data = eval("(" + response.data + ")");
                if (data.status === 1) {
                    this.setState({
                        dialog: "success"
                    });
                    window.clearInterval(this.IntervalId);
                }
            })
            .catch(error => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    "错误：" + error.message,
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
                    : this.state.packPayMethod
            });
        this.setState({ value });
    };

    handleChangeIndex = index => {
        this.setState({ value: index });
    };

    handleClose = () => {
        this.setState({
            dialog: null
        });
    };

    handleTexyChange = name => event => {
        this.setState({ [name]: event.target.value });
    };

    selectPack = id => {
        this.setState({
            selectedPack: id,
            packPayMethod:
                this.state.packPayMethod === "score"
                    ? null
                    : this.state.packPayMethod
        });
    };

    selectGroup = id => {
        this.setState({
            selectedGroup: id,
            dialog: "buyGroup",
            packPayMethod:
                this.state.packPayMethod === "score"
                    ? null
                    : this.state.packPayMethod
        });
    };

    selectPackPayMethod = event => {
        this.setState({
            packPayMethod: event.target.value
        });
    };

    render() {
        const { classes } = this.props;

        const methodSelect = (<div>
            <FormLabel>选择支付方式：</FormLabel>
            <RadioGroup
                name="spacing"
                aria-label="spacing"
                value={this.state.packPayMethod}
                onChange={this.selectPackPayMethod}
                row
            >
                {!this.state.alipay &&
                !this.state.payjs &&
                (this.state.value === 0 && (this.state.selectedPack === -1 ||
                    this.state.packs[
                        this.state.selectedPack
                        ].score === 0)) &&
                (this.state.value === 1 && (this.state.selectedGroup === -1 ||
                    this.state.groups[
                        this.state.selectedGroup
                        ].score === 0))
                && (
                    <Typography>
                        无可用支付方式
                    </Typography>
                )}
                {this.state.alipay && (
                    <FormControlLabel
                        value={"alipay"}
                        control={<Radio />}
                        label={"支付宝扫码"}
                    />
                )}
                {this.state.payjs && (
                    <FormControlLabel
                        value={"payjs"}
                        control={<Radio />}
                        label={"微信扫码"}
                    />
                )}
                {this.state.value === 0 && this.state.selectedPack !== -1 &&
                this.state.packs[
                    this.state.selectedPack
                    ].score !== 0 && (
                    <FormControlLabel
                        value={"score"}
                        control={<Radio />}
                        label={"积分支付"}
                    />
                )}
                {this.state.value === 1 && this.state.selectedGroup !== -1 &&
                this.state.groups[
                    this.state.selectedGroup
                    ].score !== 0 && (
                    <FormControlLabel
                        value={"score"}
                        control={<Radio />}
                        label={"积分支付"}
                    />
                )}
            </RadioGroup>
            <div>
                {this.state.value !== 2 &&<FormLabel>购买时长倍数：</FormLabel>}
                {this.state.value === 2 &&<FormLabel>充值积分数量：</FormLabel>}
            </div>
            {this.state.value !== 2 &&
                <TextField
                    className={classes.textField}
                    type="number"
                    inputProps={{
                        min: "1",
                        max: "99",
                        step: "1"
                    }}
                    value={this.state.times}
                    onChange={this.handleTexyChange(
                        "times"
                    )}
                />
            }
            {this.state.value === 2 &&
            <TextField
                className={classes.textField}
                type="number"
                inputProps={{
                    min: "1",
                    step: "1",
                    max: "9999999",
                }}
                value={this.state.scoreNum}
                onChange={this.handleTexyChange(
                    "scoreNum"
                )}
            />
            }

        </div>);

        return (
            <div className={classes.layout}>
                <Typography
                    color="textSecondary"
                    className={classes.title}
                    variant="h3"
                >
                    购买
                </Typography>
                <AppBar position="static">
                    <Tabs
                        value={this.state.value}
                        onChange={this.handleChange}
                        variant="fullWidth"
                    >
                        <Tab label="容量包" icon={<SdStorage />} />
                        <Tab label="会员" icon={<SupervisedUserCircle />} />
                        {this.state.scorePrice >0 && <Tab label="积分充值" icon={<AccountBalanceWallet />} />}
                        <Tab label="使用激活码" icon={<LocalPlay />} />
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
                                        当前费用：
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
                                                            {this.state.packs[
                                                                this.state
                                                                    .selectedPack
                                                            ].score *
                                                                this.state
                                                                    .times}{" "}
                                                            积分
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
                                            <ShopIcon /> 立即购买
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
                                                tier.highlight ? "推荐" : null
                                            }
                                            titleTypographyProps={{
                                                align: "center"
                                            }}
                                            subheaderTypographyProps={{
                                                align: "center"
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
                                                    {Math.ceil(
                                                        tier.time / 86400
                                                    )}
                                                    天
                                                </Typography>
                                            </div>
                                            {tier.des.map(line => (
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
                                                立即购买
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
                                        当前费用：
                                        {this.state.packPayMethod !==
                                        "score" && (
                                            <span className={classes.priceShow}>
                                                ￥

                                                    <span>
                                                            {(
                                                                this.state.scorePrice / 100 *
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
                                            onClick={() => this.buyPack("score")}
                                        >
                                            <ShopIcon /> 立即购买
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
                                label="输入激活码"
                                value={this.state.redeemCode}
                                onChange={this.handleTexyChange("redeemCode")}
                                margin="normal"
                                inputProps={{
                                    style: { textTransform: "uppercase" }
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
                                    下一步
                                </Button>
                            </div>
                        </div>
                    </Paper>
                )}
                <Dialog
                    open={this.state.dialog === "qr"}
                    onClose={this.handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">支付</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            请使用
                            {this.state.payment.type === "alipay" && (
                                <span>支付宝</span>
                            )}
                            {this.state.payment.type === "youzan" && (
                                <span>支付宝或微信</span>
                            )}
                            扫描下方二维码完成付款，付款完成后本页面会自动刷新。
                        </DialogContentText>
                        <div className={classes.codeContainer}>
                            <img
                                src={this.state.payment.img}
                                className={classes.qrcode}
                            />
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            关闭
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={this.state.dialog === "success"}
                    onClose={this.handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">支付完成</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            您所购买的商品已到账。
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            关闭
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={this.state.dialog === "redeem"}
                    onClose={this.handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">确认兑换</DialogTitle>
                    <DialogContent>
                        {this.state.redeemInfo !== null && (
                            <DialogContentText id="alert-dialog-description">
                                <Typography variant="subtitle1">
                                    商品名称：
                                </Typography>
                                <Typography>
                                    {this.state.redeemInfo.name}
                                </Typography>
                                <Typography variant="subtitle1">
                                    {this.state.redeemInfo.type === 2?"数量：":"时长："}
                                </Typography>
                                <Typography>
                                    {this.state.redeemInfo.type === 2 && <>{this.state.redeemInfo.num}</>}
                                    {this.state.redeemInfo.type !== 2 && <>{Math.ceil(
                                            this.state.redeemInfo.time / 86400
                                        ) * this.state.redeemInfo.num}
                                        天</>}

                                </Typography>
                            </DialogContentText>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose}>取消</Button>
                        <Button
                            onClick={this.confirmRedeem}
                            color="primary"
                            disabled={this.state.loading}
                        >
                            确认兑换
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
                        购买用户组
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            已选：
                            {this.state.selectedGroup !== -1 &&
                                this.state.groups[this.state.selectedGroup]
                                    .name}
                        </DialogContentText>
                       {methodSelect}
                        <div>
                            当前费用：
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
                                                {this.state.groups[
                                                    this.state.selectedGroup
                                                ].score * this.state.times}{" "}
                                                积分
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
                            取消
                        </Button>
                        <Button
                            disabled={this.state.loading || this.state.packPayMethod ===
                            null}
                            onClick={() => this.buyPack("group")}
                            color="primary"
                        >
                            购买
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
)(withStyles(styles)(BuyQuotaCompoment));

export default BuyQuota;
