import React, { Component } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames';
import { toggleSnackbar, } from "../actions/index"
import axios from 'axios'

import {
    withStyles,
    Typography,
    Paper,
    Button,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
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
    data: {
        fontSize: "25px",
        color: theme.palette.primary.main,
    },
    proBar:{
        height: "10px",
    },
    r1:{
        backgroundColor:"#f0ad4e",
        transition:"width .6s ease",
        height: "100%",
        fontSize: "12px",
        lineHeight: "20px",
        float: "left",
    },
    r2:{
        backgroundColor:"#4caf50",
        transition:"width .6s ease",
        height: "100%",
        fontSize: "12px",
        lineHeight: "20px",
        float: "left",
    },
    r3:{
        backgroundColor:"#5bc0de",
        transition:"width .6s ease",
        height: "100%",
        fontSize: "12px",
        lineHeight: "20px",
        float: "left",
    },
    note_block:{
        width: "10px",
        height: "10px",
        display: "inline-block",
        position: "relative",
        marginLeft: "10px",
        marginRight: "3px",
    },
    r1_block:{
        backgroundColor:"#f0ad4e",
    },
    r2_block:{
        backgroundColor:"#4caf50",
    },
    r3_block:{
        backgroundColor:"#5bc0de",
    },
    title:{
        marginTop: "30px",
        marginBottom: "30px",
    },
    button: {
        margin: theme.spacing(1),
    },
    table:{
        overflowX:"auto",
    },
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

class QuotaCompoment extends Component {

    state = {
        data: {
            basic: "--",
            used: "--",
            total: "--",
            pack: "--",
            r1:0,
            r2:0,
            r3:0,
        },
    };

    firstLoad = true;

    componentDidMount(){
        if(this.firstLoad){
            this.firstLoad = !this.firstLoad;
            axios.get("/Member/Memory")
            .then( (response)=> {
                this.setState({
                    data:{
                        used:response.data.used,
                        pack:response.data.pack,
                        total:response.data.total,
                        basic:response.data.basic,
                        r1:response.data.r1,
                        r2:response.data.r2,
                        r3:response.data.r3,
                    }
                });
                
            })
            .catch((error) =>{
                this.setState({
                    loading:false,
                });
                this.props.toggleSnackbar("top","right",error.message ,"error");
            });
        }
    }

    render() {
        const { classes } = this.props;


        return (
            <div className={classes.layout}>
                <Typography color="textSecondary" variant="h3">容量配额</Typography>
                <Grid container className={classes.gird} spacing={24}>
                    <Grid item xs={12} sm={3}>
                        <Paper className={classes.paper}>
                            <Typography className={classes.data}>{this.state.data.basic}</Typography>
                            <Typography>用户组基础容量</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Paper className={classes.paper}>
                            <Typography className={classes.data}>{this.state.data.pack}</Typography>
                            <Typography>有效容量包附加附加容量</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Paper className={classes.paper}>
                            <Typography className={classes.data}>{this.state.data.used}</Typography>
                            <Typography>已使用容量</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Paper className={classes.paper}>
                            <Typography className={classes.data}>{this.state.data.total}</Typography>
                            <Typography>总容量</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper className={classes.paper}>
                            <div className={classes.proBar}>
                                <div className={classes.r1} style={{"width":this.state.data.r1+"%"}}></div>
                                <div className={classes.r2} style={{"width":this.state.data.r2+"%"}}></div>
                                <div className={classes.r3} style={{"width":this.state.data.r3+"%"}}></div>
                           </div>
                           <div style={{textAlign:"right"}} >
                                <span className={classNames(classes.r1_block,classes.note_block)}></span>已用容量
                                <span className={classNames(classes.r2_block,classes.note_block)}></span>用户组基础容量
                                <span className={classNames(classes.r3_block,classes.note_block)}></span>有效容量包附加附加容量
                           </div>
                        </Paper>
                    </Grid>
                </Grid>
                <Typography color="textSecondary" variant="h3" className={classes.title}>可用容量包</Typography>
                <Paper className={classes.paper}>
                <Button 
                variant="contained" 
                color="secondary" 
                className={classes.button}
                onClick={()=>window.location.href="/Home/Quota?buyPack=1"}
                >
                    购买容量包
                </Button>
                <Button variant="contained" className={classes.button}
                 onClick={()=>window.location.href="/Home/Quota?redeem=1"}
                >
                    使用激活码兑换
                </Button>
                <div className={classes.table}>
                <Table>
                    <TableHead>
                    <TableRow>
                        <TableCell align="left">容量包名称</TableCell>
                        <TableCell align="center">大小</TableCell>
                        <TableCell align="center">激活日期</TableCell>
                        <TableCell align="center">有效期</TableCell>
                        <TableCell align="center">过期日期</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                        {window.list.map(row => (
                            <TableRow key={row.id}>
                                <TableCell component="th" scope="row">
                                    {row.p_name}
                                </TableCell>
                                <TableCell align="center">{row.pack_size}</TableCell>
                                <TableCell align="center">{row.act_time}</TableCell>
                                <TableCell align="center">{row.active_time}天</TableCell>
                                <TableCell align="center">{row.dlay_time}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </div>
                </Paper>
            </div>
        );
    }

}

const Quota = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(QuotaCompoment))

export default Quota
