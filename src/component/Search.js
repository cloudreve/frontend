import React, { Component } from "react";
import { connect } from "react-redux";
import { toggleSnackbar } from "../actions/index";
import OpenIcon from "@material-ui/icons/OpenInNew";
import FileIcon from "@material-ui/icons/InsertDriveFile";
import FolderIcon from "@material-ui/icons/Folder";

import {
    withStyles,
    Tooltip,
    Card,
    Avatar,
    CardHeader,
    Typography,
    Grid,
    IconButton
} from "@material-ui/core";

const styles = theme => ({
    card: {
        maxWidth: 400,
        margin: "0 auto"
    },
    actions: {
        display: "flex"
    },
    layout: {
        width: "auto",
        marginTop: "50px",
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
            width: 1100,
            marginLeft: "auto",
            marginRight: "auto"
        }
    },
    shareTitle: {
        maxWidth: "200px"
    },
    avatarFile: {
        backgroundColor: theme.palette.primary.light
    },
    avatarFolder: {
        backgroundColor: theme.palette.secondary.light
    },
    gird: {
        marginTop: "30px"
    }
});
const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = dispatch => {
    return {
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
        }
    };
};

class SearchCompoment extends Component {
    state = {
        shareList: []
    };

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.layout}>
                <Typography color="textSecondary" variant="h3">
                    搜索结果
                </Typography>
                <Grid container spacing={24} className={classes.gird}>
                    {window.list.map(value => (
                        <Grid item xs={12} sm={4} key={value.id}>
                            <Card className={classes.card}>
                                <CardHeader
                                    avatar={
                                        <div>
                                            {value.source_type === "file" && (
                                                <Avatar
                                                    className={
                                                        classes.avatarFile
                                                    }
                                                >
                                                    <FileIcon />
                                                </Avatar>
                                            )}
                                            {value.source_type === "dir" && (
                                                <Avatar
                                                    className={
                                                        classes.avatarFolder
                                                    }
                                                >
                                                    <FolderIcon />
                                                </Avatar>
                                            )}
                                        </div>
                                    }
                                    action={
                                        <Tooltip placement="top" title="打开">
                                            <IconButton
                                                onClick={() =>
                                                    window.open(
                                                        "/s/" + value.share_key
                                                    )
                                                }
                                            >
                                                <OpenIcon />
                                            </IconButton>
                                        </Tooltip>
                                    }
                                    title={
                                        <Tooltip
                                            placement="top"
                                            title={value.fileData}
                                        >
                                            <Typography
                                                noWrap
                                                className={classes.shareTitle}
                                            >
                                                {value.fileData}
                                            </Typography>
                                        </Tooltip>
                                    }
                                    subheader={value.share_time}
                                />
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </div>
        );
    }
}

const Search = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(SearchCompoment));

export default Search;
