import React, { Component } from 'react'
import { connect } from 'react-redux'
import { toggleSnackbar, } from "../actions/index"
import SdStorage from '@material-ui/icons/SdStorage'
import ShopIcon from '@material-ui/icons/ShoppingCart'
import axios from 'axios'
import PackSelect from './PackSelect'
import SupervisedUserCircle from '@material-ui/icons/SupervisedUserCircle'
import StarIcon from '@material-ui/icons/StarBorder';
import LocalPlay from '@material-ui/icons/LocalPlay'

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
    CardHeader,
} from '@material-ui/core';

const styles = theme => ({
    layout: {
        width: 'auto',
        marginTop: '50px',
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
            width: 1100,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
        marginBottom:"50px",
    },

    gird: {
        marginTop: "30px",
    },
    paper: {
        padding: theme.spacing(2),
        color: theme.palette.text.secondary,
    },
    title:{
        marginTop: "30px",
        marginBottom: "30px",
    },
    button: {
        margin: theme.spacing(1),
    },
    action:{
        textAlign:"right",
        marginTop:"20px",
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 70,
        textAlign:"center!important",
    },
    priceShow:{
        color: theme.palette.secondary.main,
        fontSize:"30px",
    },
    codeContainer:{
        textAlign:"center",
        marginTop:"20px",
    },
    cardHeader: {
        backgroundColor: theme.palette.grey[200],
      },
      cardPricing: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'baseline',
        marginBottom: theme.spacing(2),
      },
      cardActions: {
        [theme.breakpoints.up('sm')]: {
          paddingBottom: theme.spacing(2),
        },
      },
      redeemContainer:{
        [theme.breakpoints.up("sm")]: {
            marginLeft: "50px",
            marginRight: "50px",
            width:"auto",
        },
        marginTop:"50px",
        marginBottom:"50px",
      },
      doRedeem:{
          textAlign:"right",
      }
})
const mapStateToProps = state => {
    return {
    }
}

const mapDispatchToProps = dispatch => {
    return {
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color))
        },
    }
}

class BuyQuotaCompoment extends Component {

    IntervalId = null;
    firstLoad = true;

    constructor(props){
        super(props);
        this.state = {
            value: this.props.tabID,
            selectedPack:-1,
            selectedGroup:-1,
            times:1,
            loading:false,
            redeemCode:"",
            dialog:null,
            payment:{
                type:"",
                img:"",
            },
            redeemInfo:null,
        };
    }

    componentDidMount(){
        if(this.firstLoad){
            this.firstLoad = !this.firstLoad;
        }
    }

    confirmRedeem = ()=>{
        this.setState({
            loading:true,
        });
        axios.post("/Member/doRedeem",{
            id:this.state.redeemCode
        }).then((response)=> {
            if(response.data.error === 1){
                this.setState({
                    loading:false,
                });
                this.props.toggleSnackbar("top","right",response.data.msg,"warning");
            }else if (response.data.error === 200) {
                this.setState({
                    loading:false,
                    dialog:"success",
                });
            }
        }).catch((error) =>{
            this.setState({
                loading:false,
            });
            this.props.toggleSnackbar("top","right","错误："+error.message ,"error");
        })
    }

    doRedeem = ()=>{
        if(this.state.redeemCode===""){
            this.props.toggleSnackbar("top","right","请输入激活码" ,"warning");
            return;
        }
        this.setState({
            loading:true,
        });
        axios.post("/Member/checkRedeemCode",{
            id:this.state.redeemCode
        }).then((response)=> {
            if(response.data.error === 1){
                this.setState({
                    loading:false,
                });
                this.props.toggleSnackbar("top","right",response.data.msg,"warning");
            }else if (response.data.error === 200) {
                this.setState({
                    loading:false,
                    dialog:"redeem",
                    redeemInfo:response.data.result,
                });
            }
        }).catch((error) =>{
            this.setState({
                loading:false,
            });
            this.props.toggleSnackbar("top","right","错误："+error.message ,"error");
        })
    }

    buyPack = (packType)=>{
        if(packType==="pack"&&this.state.selectedPack === -1){
            this.props.toggleSnackbar("top","right","请先选择一个容量包" ,"warning");
            return;
        }
        this.setState({
            loading:true,
        });
        axios.post("/Buy/PlaceOrder",{
            action: packType,
			id: packType==="pack"?window.pack_data[this.state.selectedPack].id:window.group_data[this.state.selectedGroup].id,
			num:this.state.times,
        }).then((response)=> {
            if(response.data.error === 1){
                this.setState({
                    loading:false,
                });
                this.props.toggleSnackbar("top","right",response.data.msg,"warning");
            }else if (response.data.error === 200) {
                this.setState({
                    loading:false,
                    dialog:"qr",
                    payment:{
                        type:"alipay",
                        img:response.data.qrcode,
                    },
                });
                this.IntervalId = window.setInterval(() =>{
                    this.querryLoop(response.data.id);
                }, 3000);
            }else if (response.data.error === 201) {
                this.setState({
                    loading:false,
                    dialog:"qr",
                    payment:{
                        type:"youzan",
                        img:response.data.qrcode,
                    },
                });
                this.IntervalId = window.setInterval(() =>{
                    this.querryLoop(response.data.id);
                }, 3000);
            }
        }).catch((error) =>{
            this.setState({
                loading:false,
            });
            this.props.toggleSnackbar("top","right","错误："+error.message ,"error");
        })
    }

    querryLoop= id=>{
        axios.get("/Buy/querryStatus?id=" + id).then(response=>{
            var data = eval('(' + response.data + ')')
            if(data.status===1){
                this.setState({
                    dialog:"success",
                });
                window.clearInterval(this.IntervalId);
            }
        }).catch((error) =>{
            this.props.toggleSnackbar("top","right","错误："+error.message ,"error");
            window.clearInterval(this.IntervalId);
        })
    }

    handleChange = (event, value) => {
        this.setState({ value });
    };
    
    handleChangeIndex = index => {
        this.setState({ value: index });
    };

    handleClose = ()=>{
        this.setState({
            dialog:null,
        });
    }

    handleTexyChange = name => event => {
        this.setState({ [name]: event.target.value });
      };

    selectPack = id=>{
        this.setState({
            selectedPack:id
        })
    }

    selectGroup = id=>{
        this.setState({
            selectedGroup:id,
            dialog:"buyGroup",
        })
        
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.layout}>
                <Typography color="textSecondary" className={classes.title} variant="h3">购买</Typography>
                <AppBar position="static">
                        <Tabs
                            value={this.state.value}
                            onChange={this.handleChange}
                            variant="fullWidth"
                        >
                            <Tab label="容量包" icon={<SdStorage/>} />
                            <Tab label="会员" icon={<SupervisedUserCircle/>} />
                            <Tab label="使用激活码" icon={<LocalPlay/>}/>
                        </Tabs>
                    </AppBar>
                {this.state.value===0 && 
                <Paper className={classes.paper} square={true}>
                    <Grid container spacing={24}>
                        {window.pack_data.map(((value,id)=>(
                            <Grid item xs={12} md={3} key={id}>
                                <PackSelect pack={value} onSelect={()=>this.selectPack(id)} active={this.state.selectedPack === id}></PackSelect>
                            </Grid>
                        )))}
                    </Grid>
                    <div className={classes.action}>
                        <div>购买时长倍数：
                            <TextField
                                className={classes.textField}
                                type="number"
                                inputProps={{ min: "1", max: "99", step: "1" }}
                                value={this.state.times}
                                onChange={this.handleTexyChange('times')}
                            ></TextField>
                        </div>
                        <div>
                            当前费用：<span className={classes.priceShow}>￥
                                {this.state.selectedPack === -1 &&
                                    <span>--</span>
                                }
                                {(this.state.selectedPack !== -1 &&this.state.times<=99&&this.state.times>=1) &&
                                    <span>{window.pack_data[this.state.selectedPack].price*this.state.times}</span>
                                }
                            </span>
                        </div>
                        <div>
                        <Button 
                            size="large"
                            variant="contained" 
                            color="secondary" 
                            className={classes.button}
                            disabled={this.state.loading}
                            onClick={()=>this.buyPack("pack")}
                            >
                            <ShopIcon/> 立即购买
                        </Button>
                        </div>
                    </div>
                </Paper>}
                {this.state.value==1&&
                
                     <Paper className={classes.paper} square={true}><Grid container spacing={40} alignItems="flex-end">
                        {window.group_data.map((tier,id) => (
                            // Enterprise card is full width at sm breakpoint
                            <Grid item key={id} xs={12} sm={6} md={4}>
                            <Card>
                                <CardHeader
                                title={tier.name}
                                subheader={tier.highlight?"推荐":null}
                                titleTypographyProps={{ align: 'center' }}
                                subheaderTypographyProps={{ align: 'center' }}
                                action={tier.highlight? <StarIcon /> : null}
                                className={classes.cardHeader}
                                />
                                <CardContent>
                                <div className={classes.cardPricing}>
                                    <Typography component="h2" variant="h3" color="textPrimary">
                                    ￥{tier.price}
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary">
                                    /{Math.ceil(tier.time / 86400)}天
                                    </Typography>
                                </div>
                                {tier.des.map(line => (
                                    <Typography variant="subtitle1" align="center" key={line}>
                                    {line}
                                    </Typography>
                                ))}
                                </CardContent>
                                <CardActions className={classes.cardActions}>
                                <Button fullWidth variant={tier.highlight?"contained":"outlined"} color="primary" onClick={()=>this.selectGroup(id)}>
                                    立即购买
                                </Button>
                                </CardActions>
                            </Card>
                            </Grid>
                        ))}</Grid>
                     </Paper>
                }

                {this.state.value==2&&
                <Paper className={classes.paper} square={true}>
                    <div className={classes.redeemContainer}>
                        <TextField
                            id="standard-name"
                            label="输入激活码"
                            value={this.state.redeemCode}
                            onChange={this.handleTexyChange('redeemCode')}
                            margin="normal"
                            inputProps={{style:{textTransform:"uppercase"}}}
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
                }
                <Dialog
                open={this.state.dialog==="qr"}
                onClose={this.handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                >
                <DialogTitle id="alert-dialog-title">支付</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        请使用{this.state.payment.type==="alipay"&&<span>支付宝</span>}{this.state.payment.type==="youzan"&&<span>支付宝或微信</span>}扫描下方二维码完成付款，付款完成后本页面会自动刷新。
                    </DialogContentText>
                    <div className={classes.codeContainer}>
                        <img src={this.state.payment.img} className={classes.qrcode}/>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="primary">
                    关闭
                    </Button>
                </DialogActions>
                </Dialog>

                <Dialog
                open={this.state.dialog==="success"}
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
                open={this.state.dialog==="redeem"}
                onClose={this.handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                >
                <DialogTitle id="alert-dialog-title">确认兑换</DialogTitle>
                <DialogContent>
                    {this.state.redeemInfo!== null &&
                        <DialogContentText id="alert-dialog-description">
                            <Typography variant="subtitle1">商品名称：</Typography>
                            <Typography >{this.state.redeemInfo.name}</Typography>
                            <Typography variant="subtitle1">时长：</Typography>
                            <Typography >{Math.ceil(this.state.redeemInfo.time / 86400)*this.state.redeemInfo.count}天</Typography>
                        </DialogContentText>
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose}>
                        取消
                    </Button>
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
                open={this.state.dialog==="buyGroup"}
                onClose={this.handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                >
                <DialogTitle id="alert-dialog-title">购买用户组</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        已选：{this.state.selectedGroup!==-1 && window.group_data[this.state.selectedGroup].name}
                    </DialogContentText>
                    <div>购买时长倍数：
                            <TextField
                                className={classes.textField}
                                type="number"
                                inputProps={{ min: "1", max: "99", step: "1" }}
                                value={this.state.times}
                                onChange={this.handleTexyChange('times')}
                            ></TextField>
                        </div>
                        <div>
                            当前费用：<span className={classes.priceShow}>￥
                                {this.state.selectedGroup === -1 &&
                                    <span>--</span>
                                }
                                {(this.state.selectedGroup !== -1 &&this.state.times<=99&&this.state.times>=1) &&
                                    <span>{window.group_data[this.state.selectedGroup].price*this.state.times}</span>
                                }
                            </span>
                            </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose}  disabled={this.state.loading}>
                        取消
                    </Button>
                    <Button  disabled={this.state.loading} onClick={()=>this.buyPack("group")} color="primary">
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
)(withStyles(styles)(BuyQuotaCompoment))

export default BuyQuota
