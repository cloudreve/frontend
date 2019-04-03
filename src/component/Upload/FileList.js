import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import FileIcon from '@material-ui/icons/InsertDriveFile';
import PhotoIcon from '@material-ui/icons/MusicNote';
import VideoIcon from '@material-ui/icons/Videocam';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import MusicIcon from '@material-ui/icons/MusicNote';
import LinearProgress from '@material-ui/core/LinearProgress';
import Slide from '@material-ui/core/Slide';
import Avatar from '@material-ui/core/Avatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import DeleteIcon from '@material-ui/icons/Delete';
import withWidth, { isWidthDown } from '@material-ui/core/withWidth';
import DialogContent from '@material-ui/core/DialogContent';

const styles = theme => ({
    appBar: {
        position: 'relative',
    },
    flex: {
        flex: 1,
    },
    progressBar:{
        marginTop:5,
    },
    minHight:{
        [theme.breakpoints.up('sm')]: {
            minWidth:500,
        }
    },
    dialogContent:{
        padding:0,
    },
    successStatus:{
        marginBottom:10,
        color:"#4caf50",
    },
    errorStatus:{
        marginBottom:10,
        color:"#ff5722",
    },
});
class FileList extends Component {

    state = {
        open: false,
        files: [
        ],
    };

    //入队
    enQueue(files) {
        var filesNow = this.state.files;
        if (filesNow.findIndex((file) => { return file.id === files.id }) === -1) {
            filesNow.push(files);
            this.setState({
                files: filesNow,
            });
        }
        console.log(this.state);

    }

    deQueue(file){
        var filesNow = this.state.files;
        var fileID = filesNow.findIndex((f) => { return f.id === file.id });
        if (fileID !== -1) {
            filesNow.splice(fileID, 1);
            this.setState({
                files: filesNow,
            });
        }
    }

    updateStatus(file){
        var filesNow = this.state.files;
        var fileID = filesNow.findIndex((f) => { return f.id === file.id });
        if (fileID !== -1) {
            if(filesNow[fileID].status!==4){
                filesNow[fileID] = file;
                this.setState({
                    files: filesNow,
                });
            }
            
        }
    }

    setComplete(file){
        var filesNow = this.state.files;
        var fileID = filesNow.findIndex((f) => { return f.id === file.id });
        if (fileID !== -1) {
            if(filesNow[fileID].status!==4){
                filesNow[fileID].status = 5;
                this.setState({
                    files: filesNow,
                });
            }
            
        }
    }

    setError(file,errMsg){
        var filesNow = this.state.files;
        var fileID = filesNow.findIndex((f) => { return f.id === file.id });
        if (fileID !== -1) {
            filesNow[fileID].status = 4;
            filesNow[fileID].errMsg = errMsg;
        }else{
            file.status = 4;
            file.errMsg = errMsg;
            filesNow.push(file);
        }
        this.setState({
            files: filesNow,
        });
    }

    Transition(props) {
        return <Slide direction="up" {...props} />;
    }
    openFileList = () => {
        if(!this.state.open){
            this.setState({ open: true });
        }
        
    };

    cancelUpload = file =>{
        this.props.cancelUpload(file);
        this.deQueue(file);
    }

    handleClose = () => {
        this.setState({ open: false });

    };

    addNewFile = () => {
        document.getElementsByClassName("uploadForm")[0].click();
    }

    render() {

        const { classes } = this.props;
        const { width } = this.props;

        const fileIcon = {
            "image":["jpg","bpm","png","gif","jpeg","webp","svg"],
            "video":["mp4","rmvb","flv","avi"],
            "audio":["mp3","ogg","flac","aac"],
        };

        this.props.inRef({
            "openFileList":this.openFileList.bind(this),
            "enQueue":this.enQueue.bind(this),
            "updateStatus":this.updateStatus.bind(this),
            "setComplete":this.setComplete.bind(this),
            "setError":this.setError.bind(this),
        });

        var listContent = (
            this.state.files.map(function(item, i){
                var progressItem;
                var queueIcon;

                if(fileIcon["image"].indexOf(item.name.split(".").pop())!==-1){
                    queueIcon = (<PhotoIcon></PhotoIcon>);
                }else if(fileIcon["video"].indexOf(item.name.split(".").pop())!==-1){
                    queueIcon = (<VideoIcon></VideoIcon>);
                }else if(fileIcon["audio"].indexOf(item.name.split(".").pop())!==-1){
                    queueIcon = (<MusicIcon></MusicIcon>);
                }else{
                    queueIcon = (<FileIcon></FileIcon>);
                }
            
                if(item.status ===5){
                    progressItem = (<ListItemText primary={item.name} secondary={<div className={classes.successStatus}>已完成<br/></div>} />);
                }else if (item.status ===2){
                    progressItem = (<ListItemText primary={item.name} secondary={<div>{window.plupload.formatSize(item.speed).toUpperCase()}/s 已上传 {window.plupload.formatSize(item.loaded).toUpperCase()} , 共 {window.plupload.formatSize(item.size).toUpperCase()} - {item.percent}% <br/><LinearProgress variant="determinate" value={item.percent} className={classes.progressBar} /></div>}/>);
                }else if (item.status ===1){
                    progressItem = (<ListItemText primary={item.name} secondary={<div>排队中<br/><LinearProgress className={classes.progressBar}/></div>} />);
                }else if (item.status ===4){
                    progressItem = (<ListItemText primary={item.name} secondary={<div className={classes.errorStatus}>{item.errMsg}<br/></div>} />);
                }else{
                    progressItem = (<ListItemText primary={item.name} secondary={item.status} />);
                }
                return (
                    <div key={i}>
                        <ListItem button >
                            <Avatar>
                                {queueIcon}
                            </Avatar>
                            {progressItem}
                            
                            <ListItemSecondaryAction>
                                <IconButton aria-label="Delete" onClick={()=>this.cancelUpload(item)}>
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>

                        </ListItem>
                        <Divider /></div>
                );
            },this)

        );

        return (
            <Dialog
            fullScreen={isWidthDown("sm", width)}
                open={this.state.open}
                onClose={this.handleClose}
                TransitionComponent={this.Transition}
            >
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <IconButton color="inherit" onClick={this.handleClose} aria-label="Close">
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="h6" color="inherit"  className={classes.flex}>
                            上传队列
                        </Typography>
                        <IconButton color="inherit" onClick={this.addNewFile}>
                           <AddIcon/>
                        </IconButton>
                    </Toolbar>
                    
                </AppBar>
                <DialogContent className={classes.dialogContent}>
                <List className={classes.minHight}>
                    {listContent}
                </List>
                </DialogContent>
            </Dialog>
        );
    }

}
FileList.propTypes = {
};

export default withStyles(styles)(withWidth()(FileList));