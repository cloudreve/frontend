import React from 'react'
import {mediaType} from "../../config";
import ImageIcon from "@material-ui/icons/PhotoSizeSelectActual";
import VideoIcon from "@material-ui/icons/Videocam";
import AudioIcon from "@material-ui/icons/Audiotrack";
import PdfIcon from "@material-ui/icons/PictureAsPdf";
import {
    Android,
    FileExcelBox,
    FilePowerpointBox,
    FileWordBox,
    MagnetOn,
    ScriptText,
    WindowRestore,
    ZipBox
} from "mdi-material-ui";
import FileShowIcon from "@material-ui/icons/InsertDriveFile";
import {makeStyles} from "@material-ui/core";
import classNames from "classnames";

const useStyles = makeStyles(theme => ({
    iconImg :  {
        color:"#d32f2f",
    },
    iconVideo :  {
        color:"#d50000",
    },
    iconAudio :  {
        color:"#651fff",
    },
    iconPdf :  {
        color:"#f44336",
    },
    iconWord :  {
        color:"#538ce5",
    },
    iconPpt :  {
        color:"rgb(239, 99, 63)",
    },
    iconExcel :  {
        color:"#4caf50",
    },
    iconText :  {
        color:"#607d8b",
    },
    iconFile :  {
        color:"#424242",
    },
    iconTorrent :  {
        color:"#5c6bc0",
    },
    iconZip :  {
        color:"#f9a825",
    },
    iconAndroid :  {
        color:"#8bc34a",
    },
    iconExe :  {
        color:"#1a237e",
    },
}));

const TypeIcon = props => {
    const classes = useStyles();

    let icon;
    let fileType =props.fileName.split(".").pop().toLowerCase();
    if (mediaType["image"].indexOf(fileType)!==-1){
        icon = (<ImageIcon className={classNames(classes.iconImg, props.className)}/>);
    }else if(mediaType["video"].indexOf(fileType)!==-1){
        icon = (<VideoIcon className={classNames(classes.iconVideo, props.className)}/>);
    }else if(mediaType["audio"].indexOf(fileType)!==-1){
        icon = (<AudioIcon className={classNames(classes.iconAudio, props.className)}/>);
    }else if(mediaType["pdf"].indexOf(fileType)!==-1){
        icon = (<PdfIcon className={classNames(classes.iconPdf, props.className)}/>);
    }else if(mediaType["word"].indexOf(fileType)!==-1){
        icon = (<FileWordBox className={classNames(classes.iconWord, props.className)}/>);
    }else if(mediaType["ppt"].indexOf(fileType)!==-1){
        icon = (<FilePowerpointBox className={classNames(classes.iconPpt, props.className)}/>);
    }else if(mediaType["excel"].indexOf(fileType)!==-1){
        icon = (<FileExcelBox className={classNames(classes.iconExcel, props.className)}/>);
    }else if(mediaType["text"].indexOf(fileType)!==-1){
        icon = (<ScriptText className={classNames(classes.iconText, props.className)}/>);
    }else if(mediaType["torrent"].indexOf(fileType)!==-1){
        icon = (<MagnetOn className={classNames(classes.iconTorrent, props.className)}/>);
    }else if(mediaType["zip"].indexOf(fileType)!==-1){
        icon = (<ZipBox className={classNames(classes.iconZip, props.className)}/>);
    }else if(mediaType["excute"].indexOf(fileType)!==-1){
        icon = (<WindowRestore className={classNames(classes.iconExe, props.className)}/>);
    }else if(mediaType["android"].indexOf(fileType)!==-1){
        icon = (<Android className={classes.iconAndroid} className={classNames(classes.iconAndroid, props.className)}/>);
    }else{
        icon = (<FileShowIcon className={classNames(classes.iconText, props.className)}/>);
    }
    return (<>{icon}</>)
}

export default TypeIcon