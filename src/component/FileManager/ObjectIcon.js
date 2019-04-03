import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import {
    changeContextMenu,
    setSelectedTarget,
    addSelectedTarget,
    removeSelectedTarget,
    setNavigatorLoadingStatus,
    navitateTo,
    showImgPreivew,
    openMusicDialog,
    toggleSnackbar
} from "../../actions/index"
import { withStyles } from '@material-ui/core/styles';
import Folder from "./Folder"
import FileIcon from "./FileIcon"
import SmallIcon from "./SmallIcon"
import TableItem from "./TableRow"
import classNames from 'classnames';
import {isPreviewable} from "../../config"
import {allowSharePreview} from "../../untils/index"
const styles = theme => ({
    container: {
        padding: "7px",
    },
    fixFlex:{
        minWidth:0,
    }
})

const mapStateToProps = state => {
    return {
        path: state.navigator.path,
        selected: state.explorer.selected,
        viewMethod:state.viewUpdate.explorerViewMethod,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        ContextMenu: (type, open) => {
            dispatch(changeContextMenu(type, open))
        },
        setSelectedTarget: targets => {
            dispatch(setSelectedTarget(targets))
        },
        addSelectedTarget: targets => {
            dispatch(addSelectedTarget(targets))
        },
        removeSelectedTarget: id => {
            dispatch(removeSelectedTarget(id));
        },
        setNavigatorLoadingStatus: status => {
            dispatch(setNavigatorLoadingStatus(status));
        },
        navitateTo:path => {
            dispatch(navitateTo(path))
        },
        showImgPreivew:(first)=>{
            dispatch(showImgPreivew(first))
        },
        openMusicDialog:()=>{
            dispatch(openMusicDialog())
        },
        toggleSnackbar:(vertical,horizontal,msg,color)=>{
            dispatch(toggleSnackbar(vertical,horizontal,msg,color))
        },
    }
}

class ObjectCompoment extends Component {

    state = {
    }

    contextMenu = (e) => {
        e.preventDefault();
        if ((this.props.selected.findIndex((value) => {
            return value === this.props.file;
        })) === -1) {
            this.props.setSelectedTarget([this.props.file]);
        }
        this.props.ContextMenu("file", true);
    } 

    selectFile = (e) => {
        let presentIndex = this.props.selected.findIndex((value) => {
            return value === this.props.file;
        });
        if (presentIndex !== -1 && e.ctrlKey) {
            this.props.removeSelectedTarget(presentIndex);
        } else {
            if (e.ctrlKey) {
                this.props.addSelectedTarget(this.props.file);
            } else {
                this.props.setSelectedTarget([this.props.file]);
            }
        }
    } 

    handleClick=(e)=> {
        if(window.isMobile){
            this.selectFile(e);
            if(this.props.file.type==="dir"){
                this.enterFolder();
                return;
            }
        }else{
            this.selectFile(e);
        }
        
    }

    handleDoubleClick() {
        if(this.props.file.type==="dir"){
            this.enterFolder();
            return;
        }
        if(!allowSharePreview()){
            this.props.toggleSnackbar("top","right","未登录用户无法预览","warning");
            return;
        }
        let previewPath = this.props.selected[0].path === "/" ? this.props.selected[0].path+this.props.selected[0].name:this.props.selected[0].path+"/"+this.props.selected[0].name;
        switch(isPreviewable(this.props.selected[0].name)){
            case 'img':
                this.props.showImgPreivew(this.props.selected[0]);
                return;
            case 'msDoc':
                window.open(window.apiURL.docPreiview+"/?path="+encodeURIComponent(previewPath));  
                return;
            case 'audio':
                this.props.openMusicDialog();
                return;
            case 'open':
                window.open(window.apiURL.preview+"/?action=preview&path="+encodeURIComponent(previewPath));  
                return;
            case 'video':
                if(window.isSharePage){
                    window.location.href=("/Viewer/Video?share=true&shareKey="+window.shareInfo.shareId+"&path="+encodeURIComponent(previewPath));  
                    return;
                }
                window.location.href=("/Viewer/Video?path="+encodeURIComponent(previewPath));  
                return;
            case 'edit':
                if(window.isSharePage){
                    window.location.href=("/Viewer/Markdown?share=true&shareKey="+window.shareInfo.shareId+"&path="+encodeURIComponent(previewPath));  
                    return;
                }
                window.location.href=("/Viewer/Markdown?path="+encodeURIComponent(previewPath));  
                return;
            default:
                window.open(window.apiURL.download+"?action=download&path="+encodeURIComponent(previewPath));
                return;
        }
        
    }

    enterFolder = ()=>{ 
        this.props.navitateTo(this.props.path==="/"?this.props.path+this.props.file.name:this.props.path+"/"+this.props.file.name );
    }

    render() {

        const { classes } = this.props;

        if(this.props.viewMethod === "list"){
            return (
                <TableItem
                    contextMenu={this.contextMenu}
                    handleClick={this.handleClick} 
                    handleDoubleClick = {this.handleDoubleClick.bind(this)}
                file={this.props.file}/>
            );
        }

        return (
            <div 
            className={classNames({
                [classes.container]: this.props.viewMethod!=="list",
            })}
            >
                <div
                    className={classes.fixFlex}
                    onContextMenu={this.contextMenu}
                    onClick={this.handleClick} 
                    onDoubleClick = {this.handleDoubleClick.bind(this)}
                >
                    {(this.props.file.type==="dir" &&this.props.viewMethod !== "list") &&
                        <Folder folder={this.props.file}/>
                    }
                    {((this.props.file.type==="file") && this.props.viewMethod === "icon") &&
                        <FileIcon file={this.props.file}/>
                    }
                    {((this.props.file.type==="file") && this.props.viewMethod === "smallIcon") &&
                        <SmallIcon file={this.props.file}/>
                    }
                </div>
            </div>
        );
    }
}

ObjectCompoment.propTypes = {
    classes: PropTypes.object.isRequired,
    file: PropTypes.object.isRequired,
};


const ObjectIcon = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(ObjectCompoment))

export default ObjectIcon