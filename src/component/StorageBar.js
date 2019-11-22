import React, { Component } from 'react'
import PropTypes from 'prop-types';
import StorageIcon from '@material-ui/icons/Storage'
import { connect } from 'react-redux'
import axios from 'axios'
import {
    toggleSnackbar,
}from "../actions/index"

import { withStyles, LinearProgress, Typography, Divider, Tooltip } from '@material-ui/core';

const mapStateToProps = state => {
    return {
        refresh:state.viewUpdate.storageRefresh,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        toggleSnackbar:(vertical,horizontal,msg,color)=>{
            dispatch(toggleSnackbar(vertical,horizontal,msg,color))
        },
    }
}

const styles = theme => ({
    iconFix:{
        marginLeft: "32px",
        marginRight: "32px",
        color: theme.palette.text.secondary,
        marginTop: "2px",
    },
    textFix:{
        "padding":" 0 0 0 16px",
    },
    storageContainer:{
        display:"flex",
        marginTop: "15px",
   
        marginBottom: "20px",
    },
    detail:{
        width: "100%",
        marginRight: "20px",
    },
    info:{
        width:"131px",
        marginTop:"5px",
    },
    bar:{
        marginTop: "5px",
    },
    stickFooter:{
        bottom: "0px",
        position: "absolute",
        backgroundColor:theme.palette.background.paper,
    },
})

class StorageBarCompoment extends Component {

    state={
        percent:0,
        used:null,
        total:null,
    }

    firstLoad = true;

    componentDidMount = ()=>{
        if(this.firstLoad){
            this.firstLoad = !this.firstLoad;
            this.updateStatus();
        }
        
    }

    componentWillReceiveProps = (nextProps)=>{
        if(this.props.refresh!==nextProps.refresh){
            this.updateStatus();
        }
    }

    updateStatus = ()=>{
        let percent = 0;
        axios.get('/Member/Memory')
        .then( (response)=> {
            if(response.data.rate>=100){
                percent = 100;
                this.props.toggleSnackbar("top","right","您的已用容量已超过容量配额，请尽快删除多余文件或购买容量","warning");
            }else{
                percent = response.data.rate;
            }
            this.setState({
                percent:percent,
                used:response.data.used,
                total:response.data.total,
            });
        })
        .catch((error) =>{
            
        });
    }

    render() {
        const { classes} = this.props;
        if(!window.isMobile){
            return (
                <div className={classes.stickFooter}><Divider/>  
            <div className={classes.storageContainer}>
                <StorageIcon className={classes.iconFix} />    
                <div className={classes.detail}>
                    存储空间
                    <LinearProgress className={classes.bar} color="secondary" variant="determinate" value={this.state.percent} />
                    <div className={classes.info}>
                    <Tooltip title={"已使用"+((this.state.used===null)?" -- ":this.state.used)+"，共"+((this.state.total===null)?" -- ":this.state.total)} placement="top">
                    <Typography variant="caption" noWrap color="textSecondary">已使用{(this.state.used===null)?" -- ":this.state.used}，共{(this.state.total===null)?" -- ":this.state.total}</Typography></Tooltip>
                    </div>
                </div>
            </div>
                  </div>
            );
        }else{
            return (
                <div className={classes.storageContainer}>
                <StorageIcon className={classes.iconFix} />    
                <div className={classes.detail}>
                    存储空间
                    <LinearProgress className={classes.bar} color="secondary" variant="determinate" value={this.state.percent} />
                    <div className={classes.info}>
                    <Tooltip title={"已使用"+((this.state.used===null)?" -- ":this.state.used)+"，共"+((this.state.total===null)?" -- ":this.state.total)} placement="top">
                    <Typography variant="caption" noWrap color="textSecondary">已使用{(this.state.used===null)?" -- ":this.state.used}，共{(this.state.total===null)?" -- ":this.state.total}</Typography></Tooltip>
                    </div>
                </div>
            </div>
            );
        }
    }
}

StorageBarCompoment.propTypes = {
    classes: PropTypes.object.isRequired,
};

const StorageBar = connect(
    mapStateToProps,
    mapDispatchToProps
)( withStyles(styles)(StorageBarCompoment))

export default StorageBar