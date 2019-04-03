import React, { Component } from 'react'
import PropTypes from 'prop-types';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import FolderIcon from '@material-ui/icons/Folder'
import { withStyles } from '@material-ui/core/styles';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import RightIcon from "@material-ui/icons/KeyboardArrowRight"
import UpIcon from "@material-ui/icons/ArrowUpward"
import { connect } from 'react-redux'
import classNames from 'classnames';
import {
    toggleSnackbar,
} from "../../actions/index"
import axios from 'axios'

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


const styles = theme => ({
    iconWhite:{
        color: theme.palette.common.white,
    },
    selected: {
          backgroundColor: theme.palette.primary.main+"!important",
          '& $primary, & $icon': {
            color: theme.palette.common.white,
          },
      },
    primary: {},
    icon: {},
    buttonIcon:{},
    selector:{
        minWidth: "300px",
    },
    container:{
        maxHeight: "330px",
        overflowY:" auto",
    }
})


class PathSelectorCompoment extends Component {

    state={
        presentPath:"/",
        dirList:[],
        selectedTarget:null,
    }

    componentDidMount= ()=>{
        let toBeLoad = this.props.presentPath;
        this.enterFolder(toBeLoad);
    }

    back = ()=>{
        let paths = this.state.presentPath.split("/");
        paths.pop();
        let toBeLoad = paths.join("/");
        this.enterFolder(toBeLoad===""?"/":toBeLoad);
    }

    enterFolder = (toBeLoad)=>{
        axios.post('/File/ListFile', {
            action: 'list',
            path: toBeLoad,
        })
        .then( (response)=> {
            var dirList =  response.data.result.filter( (x)=> {
                return (x.type === "dir" && (this.props.selected.findIndex((value)=>{
                    return (value.name === x.name )&&(value.path === x.path);
                }))===-1);
            });
            if(toBeLoad ==="/"){
                dirList.unshift({name:"/",path:""})
            }
            this.setState({
                presentPath:toBeLoad,
                dirList:dirList,
                selectedTarget:null,
            })
        })
        .catch((error) =>{
            this.props.toggleSnackbar("top","right",error.message,"warning");
        });
    }

    handleSelect = (index) =>{
        this.setState({selectedTarget:index});
        this.props.onSelect(this.state.dirList[index]);
    }

    render() {
        
        const { classes} = this.props;

        return (
            <div className={classes.container}>
            <MenuList className={classes.selector}>
                {this.state.presentPath!=="/"&&
                <MenuItem onClick={this.back}>
                    <ListItemIcon >
                        <UpIcon />
                    </ListItemIcon>
                    <ListItemText  primary="返回上一层" />
                </MenuItem>
                }
                {this.state.dirList.map((value,index)=>(
                    <MenuItem classes={{
                        selected:classes.selected
                    }} key={index} selected={this.state.selectedTarget === index} onClick={()=>this.handleSelect(index)}>
                        <ListItemIcon className={classes.icon}>
                            <FolderIcon />
                        </ListItemIcon>
                        <ListItemText classes={{ primary: classes.primary }}  primary={value.name} />
                        <ListItemSecondaryAction className={classes.buttonIcon}>
                            <IconButton className={classNames({
                                [classes.iconWhite]:this.state.selectedTarget === index,
                            })} onClick={()=>this.enterFolder(value.path === "/"?value.path+value.name:value.path+"/"+value.name)}>
                                <RightIcon  />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </MenuItem>
                ))}
                
            </MenuList>
                
            </div>
        );
    }
}

PathSelectorCompoment.propTypes = {
    classes: PropTypes.object.isRequired,
    presentPath:PropTypes.string.isRequired,
    selected:PropTypes.array.isRequired,
};
  
export default connect(
    mapStateToProps,
    mapDispatchToProps

)(withStyles(styles)(PathSelectorCompoment))