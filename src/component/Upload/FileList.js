import React, { Component } from "react";
import CloseIcon from "@material-ui/icons/Close";
import FileIcon from "@material-ui/icons/InsertDriveFile";
import PhotoIcon from "@material-ui/icons/MusicNote";
import VideoIcon from "@material-ui/icons/Videocam";
import AddIcon from "@material-ui/icons/AddCircleOutline";
import MusicIcon from "@material-ui/icons/MusicNote";
import DeleteIcon from "@material-ui/icons/Delete";
import { isWidthDown } from "@material-ui/core/withWidth";
import update from "react-addons-update";
import {
    withStyles,
    Dialog,
    ListItemText,
    ListItem,
    List,
    Divider,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    LinearProgress,
    Slide,
    Avatar,
    ListItemSecondaryAction,
    withWidth,
    DialogContent
} from "@material-ui/core";

const styles = theme => ({
    appBar: {
        position: "relative"
    },
    flex: {
        flex: 1
    },
    progressBar: {
        marginTop: 5
    },
    minHight: {
        [theme.breakpoints.up("sm")]: {
            minWidth: 500
        }
    },
    dialogContent: {
        padding: 0
    },
    successStatus: {
        marginBottom: 10,
        color: "#4caf50"
    },
    errorStatus: {
        marginBottom: 10,
        color: "#ff5722"
    },
    status: {
        marginBottom: 10
    },
    listAction: {
        marginLeft: 20,
        marginRight: 20
    }
});
class FileList extends Component {
    state = {
        open: false,
        files: []
    };

    //入队
    enQueue(files) {
        var filesNow = this.state.files;
        if (
            filesNow.findIndex(file => {
                return file.id === files.id;
            }) === -1
        ) {
            this.setState({
                files: [...filesNow, files]
            });
        }
    }

    deQueue(file) {
        var filesNow = [...this.state.files];
        var fileID = filesNow.findIndex(f => {
            return f.id === file.id;
        });
        if (fileID !== -1) {
            filesNow.splice(fileID, 1);
            this.setState({
                files: filesNow
            });
        }
    }

    updateStatus(file) {
        var filesNow = [...this.state.files];
        var fileID = filesNow.findIndex(f => {
            return f.id === file.id;
        });
        if (!file.errMsg) {
            if (filesNow[fileID] && filesNow[fileID].status !== 4) {
                filesNow[fileID] = file;
                this.setState({
                    files: filesNow
                });
            }
        }
    }

    setComplete(file) {
        var filesNow = [...this.state.files];
        var fileID = filesNow.findIndex(f => {
            return f.id === file.id;
        });
        if (fileID !== -1) {
            if (filesNow[fileID].status !== 4) {
                filesNow[fileID].status = 5;
                this.setState({
                    files: filesNow
                });
            }
        }
    }

    setError(file, errMsg) {
        var filesNow = [...this.state.files];
        var fileID = filesNow.findIndex(f => {
            return f.id === file.id;
        });
        if (fileID !== -1) {
            filesNow[fileID].status = 4;
            filesNow[fileID].errMsg = errMsg;
        } else {
            file.status = 4;
            file.errMsg = errMsg;
            filesNow.push(file);
        }
        this.setState({
            files: filesNow
        });
    }

    Transition(props) {
        return <Slide direction="up" {...props} />;
    }
    openFileList = () => {
        if (!this.state.open) {
            this.setState({ open: true });
        }
    };

    cancelUpload = file => {
        this.props.cancelUpload(file);
        this.deQueue(file);
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    addNewFile = () => {
        document.getElementsByClassName("uploadForm")[0].click();
    };

    render() {
        const { classes } = this.props;
        const { width } = this.props;

        const fileIcon = {
            image: ["jpg", "bpm", "png", "gif", "jpeg", "webp", "svg"],
            video: ["mp4", "rmvb", "flv", "avi"],
            audio: ["mp3", "ogg", "flac", "aac"]
        };

        this.props.inRef({
            openFileList: this.openFileList.bind(this),
            enQueue: this.enQueue.bind(this),
            updateStatus: this.updateStatus.bind(this),
            setComplete: this.setComplete.bind(this),
            setError: this.setError.bind(this)
        });

        var listContent = this.state.files.map(function(item, i) {
            var progressItem;
            var queueIcon;

            if (fileIcon["image"].indexOf(item.name.split(".").pop()) !== -1) {
                queueIcon = <PhotoIcon></PhotoIcon>;
            } else if (
                fileIcon["video"].indexOf(item.name.split(".").pop()) !== -1
            ) {
                queueIcon = <VideoIcon></VideoIcon>;
            } else if (
                fileIcon["audio"].indexOf(item.name.split(".").pop()) !== -1
            ) {
                queueIcon = <MusicIcon></MusicIcon>;
            } else {
                queueIcon = <FileIcon></FileIcon>;
            }

            return (
                <div key={i}>
                    <ListItem button>
                        <Avatar>{queueIcon}</Avatar>

                        <ListItemSecondaryAction>
                            <IconButton
                                aria-label="Delete"
                                onClick={() => this.cancelUpload(item)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                </div>
            );
        }, this);

        return (
            <Dialog
                fullScreen={isWidthDown("sm", width)}
                open={this.state.open}
                onClose={this.handleClose}
                TransitionComponent={this.Transition}
            >
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            onClick={this.handleClose}
                            aria-label="Close"
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography
                            variant="h6"
                            color="inherit"
                            className={classes.flex}
                        >
                            上传队列
                        </Typography>
                        <IconButton color="inherit" onClick={this.addNewFile}>
                            <AddIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <DialogContent className={classes.dialogContent}>
                    <List className={classes.minHight}>
                        {this.state.files.map((item, i) => (
                            <div key={i}>
                                <ListItem button>
                                    <Avatar>s</Avatar>
                                    {item.status === 1 && (
                                        <ListItemText
                                            className={classes.listAction}
                                            primary={item.name}
                                            secondary={
                                                <div>
                                                    排队中
                                                    <br />
                                                    <LinearProgress
                                                        className={
                                                            classes.progressBar
                                                        }
                                                    />
                                                </div>
                                            }
                                        />
                                    )}
                                    {item.status === 2 && (
                                        <ListItemText
                                            className={classes.listAction}
                                            primary={item.name}
                                            secondary={
                                                <div>
                                                    {item.percent < 99 && (
                                                        <>
                                                            {window.plupload
                                                                .formatSize(
                                                                    item.speed
                                                                )
                                                                .toUpperCase()}
                                                            /s 已上传{" "}
                                                            {window.plupload
                                                                .formatSize(
                                                                    item.loaded
                                                                )
                                                                .toUpperCase()}{" "}
                                                            , 共{" "}
                                                            {window.plupload
                                                                .formatSize(
                                                                    item.size
                                                                )
                                                                .toUpperCase()}{" "}
                                                            - {item.percent}%{" "}
                                                            <br />
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={
                                                                    item.percent
                                                                }
                                                                className={
                                                                    classes.progressBar
                                                                }
                                                            />
                                                        </>
                                                    )}
                                                    {item.percent > 99 && (
                                                        <div
                                                            className={
                                                                classes.status
                                                            }
                                                        >
                                                            处理中...
                                                        </div>
                                                    )}
                                                </div>
                                            }
                                        />
                                    )}
                                    {item.status === 3 && (
                                        <ListItemText
                                            className={classes.listAction}
                                            primary={item.name}
                                            secondary={item.status}
                                        />
                                    )}
                                    {item.status === 4 && (
                                        <ListItemText
                                            className={classes.listAction}
                                            primary={item.name}
                                            secondary={
                                                <div
                                                    className={
                                                        classes.errorStatus
                                                    }
                                                >
                                                    {item.errMsg}
                                                    <br />
                                                </div>
                                            }
                                        />
                                    )}
                                    {item.status === 5 && (
                                        <ListItemText
                                            className={classes.listAction}
                                            primary={item.name}
                                            secondary={
                                                <div
                                                    className={
                                                        classes.successStatus
                                                    }
                                                >
                                                    已完成
                                                    <br />
                                                </div>
                                            }
                                        />
                                    )}
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            aria-label="Delete"
                                            onClick={() =>
                                                this.cancelUpload(item)
                                            }
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                <Divider />
                            </div>
                        ))}
                    </List>
                </DialogContent>
            </Dialog>
        );
    }
}
FileList.propTypes = {};

export default withStyles(styles)(withWidth()(FileList));
