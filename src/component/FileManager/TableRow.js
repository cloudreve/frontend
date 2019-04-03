import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { connect } from 'react-redux'

import { withStyles } from '@material-ui/core/styles';

import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import FolderIcon from '@material-ui/icons/Folder'
import classNames from 'classnames';
import ImageIcon from '@material-ui/icons/PhotoSizeSelectActual'
import VideoIcon from '@material-ui/icons/Videocam'
import AudioIcon from '@material-ui/icons/Audiotrack'
import PdfIcon from "@material-ui/icons/PictureAsPdf"
import {FileWordBox,FilePowerpointBox,FileExcelBox,ScriptText,MagnetOn,ZipBox,WindowRestore,Android} from 'mdi-material-ui'
import FileShowIcon from "@material-ui/icons/InsertDriveFile"
import {sizeToString} from "../../untils/index"
import {mediaType} from "../../config"

const styles = theme => ({
    selected: {
        "&:hover": {
        },
        backgroundColor: theme.palette.explorer.bgSelected,

    },

    notSelected: {
        "&:hover": {
            backgroundColor: "#ececec",
        },
    },
    icon:{
        verticalAlign: "middle",
        marginRight: "20px",
        color: theme.palette.explorer.icon,
    },
    iconImg :  {
        verticalAlign: "middle",
        color:"#d32f2f",
        marginRight: "20px",
    },
    iconVideo :  {
        verticalAlign: "middle",
        color:"#d50000",
        marginRight: "20px",
    },
    iconAudio :  {
        color:"#651fff",
        marginRight: "20px",
        verticalAlign: "middle",
    },
    iconPdf :  {
        verticalAlign: "middle",
        color:"#f44336",
        marginRight: "20px",
    },
    iconWord :  {
        verticalAlign: "middle",
        color:"#538ce5",
        marginRight: "20px",
    },
    iconPpt :  {
        verticalAlign: "middle",
        color:"rgb(239, 99, 63)",
        marginRight: "20px",
    },
    iconExcel :  {
        verticalAlign: "middle",
        color:"#4caf50",
        marginRight: "20px",
    },
    iconText :  {
        verticalAlign: "middle",
        color:"#607d8b",
        marginRight: "20px",
    },
    iconFile :  {
        verticalAlign: "middle",
        color:"#424242",
        marginRight: "20px",
    },
    iconTorrent :  {
        color:"#5c6bc0",
        marginRight: "20px",
        verticalAlign: "middle",
    },
    iconZip :  {
        color:"#f9a825",
        marginRight: "20px",
        verticalAlign: "middle",
    },
    iconAndroid :  {
        color:"#8bc34a",
        marginRight: "20px",
        verticalAlign: "middle",
    },
    iconExe :  {
        color:"#1a237e",
        marginRight: "20px",
        verticalAlign: "middle",
    },
    folderNameSelected: {
        color: theme.palette.primary.dark,
        fontWeight: "500",
        userSelect: "none",
    },
    folderNameNotSelected: {
        color: theme.palette.explorer.filename,
        userSelect: "none",
    },
    folderName:{
        marginRight:"20px",
    },
    hideAuto:{
        [theme.breakpoints.down('sm')]: {
            display:"none",
        }
    }
})

const mapStateToProps = state => {
    return {
        selected: state.explorer.selected,
    }
}

const mapDispatchToProps = dispatch => {
    return {
    }
}


class TableRowCompoment extends Component {

    state = {
    }


    render() {

        const { classes } = this.props;

        let icon;
        let fileType =this.props.file.name.split(".").pop().toLowerCase();
        if(this.props.file.type==="dir"){
            icon = (<FolderIcon className={classes.icon}/>); 
        }else{
            if (mediaType["image"].indexOf(fileType)!==-1){
                icon = (<ImageIcon className={classes.iconImg}/>); 
            }else if(mediaType["video"].indexOf(fileType)!==-1){
                icon = (<VideoIcon className={classes.iconVideo}/>);   
            }else if(mediaType["audio"].indexOf(fileType)!==-1){
                icon = (<AudioIcon className={classes.iconAudio}/>);   
            }else if(mediaType["pdf"].indexOf(fileType)!==-1){
                icon = (<PdfIcon className={classes.iconPdf}/>);
            }else if(mediaType["word"].indexOf(fileType)!==-1){
                icon = (<FileWordBox className={classes.iconWord}/>); 
            }else if(mediaType["ppt"].indexOf(fileType)!==-1){
                icon = (<FilePowerpointBox className={classes.iconPpt}/>);     
            }else if(mediaType["excel"].indexOf(fileType)!==-1){
                icon = (<FileExcelBox className={classes.iconExcel}/>);
            }else if(mediaType["text"].indexOf(fileType)!==-1){
                icon = (<ScriptText className={classes.iconText}/>);
            }else if(mediaType["torrent"].indexOf(fileType)!==-1){
                icon = (<MagnetOn className={classes.iconTorrent}/>); 
            }else if(mediaType["zip"].indexOf(fileType)!==-1){
                icon = (<ZipBox className={classes.iconZip}/>);
            }else if(mediaType["excute"].indexOf(fileType)!==-1){
                icon = (<WindowRestore className={classes.iconExe}/>);
            }else if(mediaType["android"].indexOf(fileType)!==-1){
                icon = (<Android className={classes.iconAndroid}/>);
            }else{
                icon = (<FileShowIcon className={classes.iconText}/>);
            }
        }
        


        const isSelected = (this.props.selected.findIndex((value) => {
            return value === this.props.file;
        })) !== -1;

        return (
            <TableRow
                onContextMenu={this.props.contextMenu}
                onClick={this.props.handleClick} 
                onDoubleClick = {this.props.handleDoubleClick.bind(this)}
                className={classNames({
                    [classes.selected]: isSelected,
                    [classes.notSelected]: !isSelected,
                }, classes.button)}
            >
                <TableCell component="th" scope="row">
                
                    <Typography className={classNames(classes.folderName, {
                        [classes.folderNameSelected]: isSelected,
                        [classes.folderNameNotSelected]: !isSelected,
                    })}>{icon}{this.props.file.name}
                    </Typography>
                    </TableCell>
                <TableCell  className={classes.hideAuto}>
                    <Typography className={classNames(classes.folderName, {
                        [classes.folderNameSelected]: isSelected,
                        [classes.folderNameNotSelected]: !isSelected,
                    })}> {this.props.file.type!=="dir"&&sizeToString(this.props.file.size)}
                    </Typography>
                </TableCell>
                <TableCell  className={classes.hideAuto}><Typography className={classNames(classes.folderName, {
                        [classes.folderNameSelected]: isSelected,
                        [classes.folderNameNotSelected]: !isSelected,
                    })}> {this.props.file.date}
                    </Typography>
                </TableCell>
            </TableRow>
        );
    }
}

TableRowCompoment.propTypes = {
    classes: PropTypes.object.isRequired,
    file: PropTypes.object.isRequired,
};


const TableItem = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(TableRowCompoment))

export default TableItem