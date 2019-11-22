import React, { Component } from 'react'
import { connect } from 'react-redux'
import { toggleSnackbar,}from "../actions/index"
import axios from 'axios'
import LeftIcon from '@material-ui/icons/KeyboardArrowLeft'
import RighttIcon from '@material-ui/icons/KeyboardArrowRight'

import {
    withStyles,
    Paper,
    Avatar,
    Typography,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    IconButton,
    Grid,
} from '@material-ui/core';

const styles = theme => ({
    layout: {
        width: 'auto',
        marginTop:'50px',
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        marginBottom: "30px",
        [theme.breakpoints.up("sm")]: {
          width: 700,
          marginLeft: 'auto',
          marginRight: 'auto',
        },
    },
    userNav:{
        height:"270px",
        backgroundColor: theme.palette.primary.main,
        padding: "20px 20px 2em",
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'%3E%3Cpolygon fill='"+theme.palette.primary.light.replace("#","%23")+"' points='957 450 539 900 1396 900'/%3E%3Cpolygon fill='"+theme.palette.primary.dark.replace("#","%23")+"' points='957 450 872.9 900 1396 900'/%3E%3Cpolygon fill='"+theme.palette.secondary.main.replace("#","%23")+"' points='-60 900 398 662 816 900'/%3E%3Cpolygon fill='"+theme.palette.secondary.dark.replace("#","%23")+"' points='337 900 398 662 816 900'/%3E%3Cpolygon fill='"+theme.palette.secondary.light.replace("#","%23")+"' points='1203 546 1552 900 876 900'/%3E%3Cpolygon fill='"+theme.palette.secondary.main.replace("#","%23")+"' points='1203 546 1552 900 1162 900'/%3E%3Cpolygon fill='"+theme.palette.primary.dark.replace("#","%23")+"' points='641 695 886 900 367 900'/%3E%3Cpolygon fill='"+theme.palette.primary.main.replace("#","%23")+"' points='587 900 641 695 886 900'/%3E%3Cpolygon fill='"+theme.palette.secondary.light.replace("#","%23")+"' points='1710 900 1401 632 1096 900'/%3E%3Cpolygon fill='"+theme.palette.secondary.dark.replace("#","%23")+"' points='1710 900 1401 632 1365 900'/%3E%3Cpolygon fill='"+theme.palette.secondary.main.replace("#","%23")+"' points='1210 900 971 687 725 900'/%3E%3Cpolygon fill='"+theme.palette.secondary.dark.replace("#","%23")+"' points='943 900 1210 900 971 687'/%3E%3C/svg%3E\")",
        backgroundSize: "cover",
        backgroundPosition: "bottom",
    },
    avatarContainer:{
        height: "80px",
        width: "80px",
        borderRaidus:"50%",
        margin: "auto",
        marginTop: "50px",
        boxShadow: "0 2px 5px 0 rgba(0,0,0,0.16), 0 2px 10px 0 rgba(0,0,0,0.12)",
        border: "2px solid #fff",
    },
    nickName:{
        width: "200px",
        margin: "auto",
        textAlign: "center",
        marginTop: "1px",
        fontSize: "25px",
        color: "#ffffffcf",
    },
    th:{
        minWidth: "106px",
    },
    mobileHide:{
        [theme.breakpoints.down("md")]: {
            display:"none",
        }
    },
    tableLink:{
        cursor: "pointer",
    },
    navigator:{
        display:"flex",
        justifyContent:"space-between",
    },
    pageInfo:{
        marginTop: "14px",
        marginLeft: "23px",
    },
    infoItem:{
        paddingLeft: "46px!important",
        paddingBottom: "20px!important",
    },
    infoContainer:{
        marginTop:"30px",
    }
})
const mapStateToProps = state => {
    return {
    }
}

const mapDispatchToProps = dispatch => {

    return {
        toggleSnackbar:(vertical,horizontal,msg,color)=>{
            dispatch(toggleSnackbar(vertical,horizontal,msg,color))
        },
    }
}

class ProfileCompoment extends Component {

    state={
        listType:0,
        shareList:[],
        page:1,
    }

    handleChange = (event, listType) => {
        this.setState({ listType });
        if(listType===1){
            this.loadList(1,"hot");
        }else if(listType===0){
            this.loadList(1,"default");
        }
    };

    componentDidMount = ()=>{
        this.loadList(1,"default");
    }

    loadList = (page,shareType) => {
        axios.post('/Profile/getList', {
            uid:window.taegetUserInfo.uid,
            type:shareType,
            page:page,
        }).then( (response)=> {
            this.setState({
                page:page,
                shareList:response.data,
            })
        })
        .catch((error) =>{
            this.props.toggleSnackbar("top","right","加载失败","error");
        });
    }

    loadNext = ()=>{
        this.loadList(this.state.page+1,this.state.listType===0?"default":"hot");
    }

    loadPrev = ()=>{
        this.loadList(this.state.page-1,this.state.listType===0?"default":"hot");
    }

    render() {
        const { classes } = this.props;
      

        return (
            <div className={classes.layout}>
                <Paper square>
                    <div className={classes.userNav}>
                        <div >
                            <Avatar className={classes.avatarContainer} src ={"/Member/Avatar/"+window.taegetUserInfo.uid+"/l"}></Avatar>
                        </div>
                        <div>
                            <Typography className={classes.nickName} noWrap>{window.taegetUserInfo.nickname}</Typography>
                        </div>
                    </div>
                    <Tabs
                        value={this.state.listType}
                        indicatorColor="primary"
                        textColor="primary"
                        onChange={this.handleChange}
                        centered
                    >
                    <Tab label="全部分享" />
                    <Tab label="热门分享"/>
                    <Tab label="个人资料" />
                    </Tabs>
                    {this.state.listType===2&&
                    <div className={classes.infoContainer}>
                        <Grid container spacing={24}>
                            <Grid item md={4} xs={12} className={classes.infoItem}>
                                <Typography color="textSecondary" variant="h6">UID</Typography>
                                <Typography>{window.taegetUserInfo.uid}</Typography>
                            </Grid>
                            <Grid item md={4} xs={12} className={classes.infoItem}>
                                <Typography color="textSecondary" variant="h6">昵称</Typography>
                                <Typography>{window.taegetUserInfo.nickname}</Typography>
                            </Grid>
                            <Grid item md={4} xs={12} className={classes.infoItem}>
                                <Typography color="textSecondary" variant="h6">用户组</Typography>
                                <Typography>{window.taegetUserInfo.group}</Typography>
                            </Grid>
                            <Grid item md={4} xs={12} className={classes.infoItem}>
                                <Typography color="textSecondary" variant="h6">分享总数</Typography>
                                <Typography>{window.taegetUserInfo.shareCount}</Typography>
                            </Grid>
                            <Grid item md={4} xs={12} className={classes.infoItem}>
                                <Typography color="textSecondary" variant="h6">注册日期</Typography>
                                <Typography>{window.taegetUserInfo.regDate}</Typography>
                            </Grid>
                        </Grid>
                    </div>}
                    {(this.state.listType===0||this.state.listType===1)&&<div>
                        <Table className={classes.table}>
                            <TableHead>
                            <TableRow>
                                <TableCell>文件名</TableCell>
                                <TableCell className={classes.mobileHide}>分享日期</TableCell>
                                <TableCell className={[classes.th,classes.mobileHide]}>下载次数</TableCell>
                                <TableCell className={[classes.th,classes.mobileHide]}>浏览次数</TableCell>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                            {this.state.shareList.map(row => (
                                <TableRow 
                                key={row.id} 
                                className={classes.tableLink}
                                onClick = {()=>window.open("/s/"+row.share_key)}
                                >
                                <TableCell><Typography>{row.fileData}</Typography></TableCell>
                                <TableCell className={classes.mobileHide}>{row.share_time}</TableCell>
                                <TableCell className={classes.mobileHide}>{row.download_num}</TableCell>
                                <TableCell className={classes.mobileHide}>{row.view_num}</TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        {(this.state.shareList.length!==0 && this.state.listType===0)&&
                            <div className={classes.navigator}>
                                <Typography color="textSecondary" className={classes.pageInfo}>第{this.state.page}页</Typography>
                                <div>
                                    <IconButton 
                                    disabled={this.state.page===1} 
                                    onClick={this.loadPrev}
                                    >
                                        <LeftIcon/>
                                    </IconButton>
                                    <IconButton 
                                    disabled={this.state.shareList.length<10}
                                    onClick={this.loadNext}
                                    >
                                        <RighttIcon/>
                                    </IconButton>
                                </div>
                            </div>
                        }
                    </div>}
                </Paper>
            </div>
        );
    }

}

const Profile = connect(
    mapStateToProps,
    mapDispatchToProps
)( withStyles(styles)(ProfileCompoment))

export default Profile
