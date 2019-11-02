import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles';

import ButtonBase from '@material-ui/core/ButtonBase';
import Typography from '@material-ui/core/Typography';
import classNames from 'classnames';
import {allowSharePreview} from "../../untils/index"
import ImageIcon from '@material-ui/icons/PhotoSizeSelectActual'
import VideoIcon from '@material-ui/icons/Videocam'
import AudioIcon from '@material-ui/icons/Audiotrack'
import PdfIcon from "@material-ui/icons/PictureAsPdf"
import Divider from "@material-ui/core/Divider"
import FileShowIcon from "@material-ui/icons/InsertDriveFile"
import Tooltip from '@material-ui/core/Tooltip';
import {FileWordBox,FilePowerpointBox,FileExcelBox,ScriptText,MagnetOn,ZipBox,WindowRestore,Android} from 'mdi-material-ui'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import ContentLoader from 'react-content-loader'
import {mediaType} from "../../config"

const styles = theme => ({
    container: {
        padding: "7px",
    },

    selected: {
        "&:hover": {
            border: "1px solid #d0d0d0",
        },
        backgroundColor: theme.palette.explorer.bgSelected,

    },

    notSelected: {
        "&:hover": {
            backgroundColor: "#f9f9f9",
            border: "1px solid #d0d0d0",
        },
        backgroundColor: theme.palette.background.paper,
    },

    button: {
        border: "1px solid #dadce0",
        width: "100%",
        borderRadius: "6px",
        boxSizing: "border-box",
        transition: "background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
        alignItems: "initial",
        display: "initial",
    },
    folderNameSelected: {
        color: theme.palette.primary.dark,
        fontWeight: "500",
    },
    folderNameNotSelected: {
        color: theme.palette.explorer.filename,
    },
    folderName: {
        marginTop: "15px",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        overflow: "hidden",
        marginRight: "20px",
    },
    preview:{
        overflow: "hidden",
        height:"150px",
        width:"100%",
        borderRadius: "6px 6px 0 0",  
    },
    previewIcon:{
        overflow: "hidden",
        height:"149px",
        width:"100%",
        borderRadius: "6px 6px 0 0",  
        backgroundColor:theme.palette.background.paper,
        paddingTop:"50px",
    },
    picPreview:{
        "height": "auto",
        "width": "100%",
    },
    fileInfo:{
        height:"50px", 
        display: "flex",
    },
    icon: {
        margin: "10px 10px 10px 16px",
        height: "30px",
        minWidth: "30px",
        backgroundColor: theme.palette.background.paper,
        borderRadius: "90%",
        paddingTop: "2px",
        color: theme.palette.explorer.icon,
    }, 
    iconImg :  {
        color:"#d32f2f",
    },
    iconImgBig:{    
        color:"#d32f2f",
        fontSize: "50px",
    },
    iconVideo :  {
        color:"#d50000",
    },
    iconVideoBig:{    
        color:"#d50000",
        fontSize: "50px",
    },
    iconAudio :  {
        color:"#651fff",
    },
    iconAudioBig:{    
        color:"#651fff",
        fontSize: "50px",
    },
    iconPdf :  {
        color:"#f44336",
    },
    iconPdfBig:{    
        color:"#f44336",
        fontSize: "50px",
    },
    iconWord :  {
        color:"#538ce5",
    },
    iconWordBig:{    
        color:"#538ce5",
        fontSize: "50px",
    },
    iconPpt :  {
        color:"rgb(239, 99, 63)",
    },
    iconPptBig:{    
        color:"rgb(239, 99, 63)",
        fontSize: "50px",
    },
    iconExcel :  {
        color:"#4caf50",
    },
    iconExcelBig:{    
        color:"#4caf50",
        fontSize: "50px",
    },
    iconText :  {
        color:"#607d8b",
    },
    iconTextBig:{    
        color:"#607d8b",
        fontSize: "50px",
    },
    iconFile :  {
        color:"#424242",
    },
    iconFileBig:{    
        color:"#424242",
        fontSize: "50px",
    },
    iconTorrent :  {
        color:"#5c6bc0",
    },
    iconTorrentBig:{    
        color:"#5c6bc0",
        fontSize: "50px",
    },
    iconZip :  {
        color:"#f9a825",
    },
    iconZipBig:{    
        color:"#f9a825",
        fontSize: "50px",
    },
    iconAndroid :  {
        color:"#8bc34a",
    },
    iconAndroidBig:{    
        color:"#8bc34a",
        fontSize: "50px",
    },
    iconExe :  {
        color:"#1a237e",
    },
    iconExeBig:{    
        color:"#1a237e",
        fontSize: "50px",
    },
    hide:{
        display:"none",
    },
    loadingAnimation:{
        borderRadius: "6px 6px 0 0",
    },
    shareFix:{
        marginLeft: "20px",
    }
})

const mapStateToProps = state => {
    return {
        path: state.navigator.path,
        selected: state.explorer.selected,
    }
}

const mapDispatchToProps = dispatch => {
    return {

    }
}

class FileIconCompoment extends Component {

    static defaultProps = {
        share: false,
    }

    state={
        loading:false,
        showPicIcon:false,
    }

    render() {

        const { classes } = this.props;

        const isSelected = (this.props.selected.findIndex((value) => {
            return value === this.props.file;
        })) !== -1;

        let icon,iconBig;
        let fileType =this.props.file.name.split(".").pop().toLowerCase();
        if (mediaType["image"].indexOf(fileType)!==-1){
            icon = (<ImageIcon className={classes.iconImg}/>);
            iconBig = (<ImageIcon className={classes.iconImgBig}/>);
        }else if(mediaType["video"].indexOf(fileType)!==-1){
            icon = (<VideoIcon className={classes.iconVideo}/>);
            iconBig = (<VideoIcon className={classes.iconVideoBig}/>); 
        }else if(mediaType["audio"].indexOf(fileType)!==-1){
            icon = (<AudioIcon className={classes.iconAudio}/>);
            iconBig = (<AudioIcon className={classes.iconAudioBig}/>); 
        }else if(mediaType["pdf"].indexOf(fileType)!==-1){
            icon = (<PdfIcon className={classes.iconPdf}/>);
            iconBig = (<PdfIcon className={classes.iconPdfBig}/>); 
        }else if(mediaType["word"].indexOf(fileType)!==-1){
            icon = (<FileWordBox className={classes.iconWord}/>);
            iconBig = (<FileWordBox className={classes.iconWordBig}/>); 
        }else if(mediaType["ppt"].indexOf(fileType)!==-1){
            icon = (<FilePowerpointBox className={classes.iconPpt}/>);
            iconBig = (<FilePowerpointBox className={classes.iconPptBig}/>); 
        }else if(mediaType["excel"].indexOf(fileType)!==-1){
            icon = (<FileExcelBox className={classes.iconExcel}/>);
            iconBig = (<FileExcelBox className={classes.iconExcelBig}/>);  
        }else if(mediaType["text"].indexOf(fileType)!==-1){
            icon = (<ScriptText className={classes.iconText}/>);
            iconBig = (<ScriptText className={classes.iconTextBig}/>);  
        }else if(mediaType["torrent"].indexOf(fileType)!==-1){
            icon = (<MagnetOn className={classes.iconTorrent}/>);
            iconBig = (<MagnetOn className={classes.iconTorrentBig}/>);  
        }else if(mediaType["zip"].indexOf(fileType)!==-1){
            icon = (<ZipBox className={classes.iconZip}/>);
            iconBig = (<ZipBox className={classes.iconZipBig}/>);  
        }else if(mediaType["excute"].indexOf(fileType)!==-1){
            icon = (<WindowRestore className={classes.iconExe}/>);
            iconBig = (<WindowRestore className={classes.iconExeBig}/>);  
        }else if(mediaType["android"].indexOf(fileType)!==-1){
            icon = (<Android className={classes.iconAndroid}/>);
            iconBig = (<Android className={classes.iconAndroidBig}/>);  
        }else{
            icon = (<FileShowIcon className={classes.iconText}/>);
            iconBig = (<FileShowIcon className={classes.iconTextBig}/>);  
        }

        return (
            <div className={classes.container}>
                <ButtonBase
                    focusRipple
                    className={classNames({
                        [classes.selected]: isSelected,
                        [classes.notSelected]: !isSelected,
                    }, classes.button)}
                >
                {(this.props.file.pic!==""&&!this.state.showPicIcon&& this.props.file.pic!==" "&& this.props.file.pic!=="null,null"&&allowSharePreview())&&
                    <div className={classes.preview}> 
                    <LazyLoadImage
                        className = {classNames({
                            [classes.hide]:this.state.loading,
                            [classes.picPreview]:!this.state.loading,
                        })}
                        src={window.apiURL.imgThumb+"?isImg=true&path="+encodeURIComponent(this.props.file.path==="/"?this.props.file.path+this.props.file.name:this.props.file.path+"/"+this.props.file.name)}
                        afterLoad = {()=>this.setState({loading:false})}
                        beforeLoad = {()=>this.setState({loading:true})}
                        onError={()=>this.setState({showPicIcon:true})}
                        />  
                        <ContentLoader
                        height={150}
                        width={170}
                        className = {classNames({
                            [classes.hide]:!this.state.loading, 
                        },classes.loadingAnimation)}
                        >
                            <rect x="0" y="0" width="100%" height="150" />
                        </ContentLoader>
                        
                         
                
                    </div>
                }
                {(this.props.file.pic===""||this.state.showPicIcon|| this.props.file.pic===" "||this.props.file.pic==="null,null"||!allowSharePreview())&&
                    <div className={classes.previewIcon}>
                        {iconBig}
                    </div>
                   
            } 
            {(this.props.file.pic===""|| this.state.showPicIcon||this.props.file.pic===" "||this.props.file.pic==="null,null"||!allowSharePreview())&& <Divider/> }
                    <div className={classes.fileInfo}>
                        {!this.props.share&&<div className={classNames(classes.icon, {
                            [classes.iconSelected]: isSelected,
                            [classes.iconNotSelected]: !isSelected,
                        })}>{icon}</div>}
                        <Tooltip title={this.props.file.name} aria-label={this.props.file.name}>
                            <Typography className={classNames(classes.folderName, {
                                [classes.folderNameSelected]: isSelected,
                                [classes.folderNameNotSelected]: !isSelected,
                                [classes.shareFix]:this.props.share,
                            })}>{this.props.file.name}</Typography>
                        </Tooltip>
                    </div>
                </ButtonBase>
 
            </div>
        ); 
    }
}

FileIconCompoment.propTypes = {
    classes: PropTypes.object.isRequired,
    file: PropTypes.object.isRequired,
};


const FileIcon = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(FileIconCompoment))

export default FileIcon