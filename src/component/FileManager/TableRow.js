import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import FolderIcon from "@material-ui/icons/Folder";
import classNames from "classnames";
import ImageIcon from "@material-ui/icons/PhotoSizeSelectActual";
import VideoIcon from "@material-ui/icons/Videocam";
import AudioIcon from "@material-ui/icons/Audiotrack";
import PdfIcon from "@material-ui/icons/PictureAsPdf";
import {
    FileWordBox,
    FilePowerpointBox,
    FileExcelBox,
    ScriptText,
    MagnetOn,
    ZipBox,
    WindowRestore,
    Android
} from "mdi-material-ui";
import FileShowIcon from "@material-ui/icons/InsertDriveFile";
import { sizeToString } from "../../untils/index";
import { mediaType } from "../../config";

import { withStyles, TableCell, TableRow, Typography } from "@material-ui/core";
import TypeIcon from "./TypeIcon";

const styles = theme => ({
    selected: {
        "&:hover": {},
        backgroundColor: theme.palette.type == "dark" ? theme.palette.background.paper : theme.palette.explorer.bgSelected,
    },

    notSelected: {
        "&:hover": {
            backgroundColor: theme.palette.background.default,
        }
    },
    icon: {
        verticalAlign: "middle",
        marginRight: "20px",
        color: theme.palette.explorer.icon
    },
    tableIcon:{
        marginRight: "20px",
        verticalAlign: "middle",
    },
    folderNameSelected: {
        color: theme.palette.type == "dark" ? "#fff" : theme.palette.primary.dark,
        fontWeight: "500",
        userSelect: "none"
    },
    folderNameNotSelected: {
        color: theme.palette.text.secondary,
        userSelect: "none"
    },
    folderName: {
        marginRight: "20px"
    },
    hideAuto: {
        [theme.breakpoints.down("sm")]: {
            display: "none"
        }
    },
    tableRow: {
        padding: "10px 16px"
    }
});

const mapStateToProps = state => {
    return {
        selected: state.explorer.selected
    };
};

const mapDispatchToProps = dispatch => {
    return {};
};

class TableRowCompoment extends Component {
    state = {};

    render() {
        const { classes } = this.props;

        let icon;
        let fileType = this.props.file.name
            .split(".")
            .pop()
            .toLowerCase();
        if (this.props.file.type === "dir") {
            icon = <FolderIcon className={classes.icon} />;
        } else {
           icon = <TypeIcon className={classes.tableIcon} fileName={this.props.file.name}/>
        }

        const isSelected =
            this.props.selected.findIndex(value => {
                return value === this.props.file;
            }) !== -1;

        return (
            <TableRow
                onContextMenu={this.props.contextMenu}
                onClick={this.props.handleClick}
                onDoubleClick={this.props.handleDoubleClick.bind(this)}
                className={classNames(
                    {
                        [classes.selected]: isSelected,
                        [classes.notSelected]: !isSelected
                    }
                )}
            >
                <TableCell component="th" scope="row" className={classes.tableRow}>
                    <Typography
                        variant="body2"
                        className={classNames(classes.folderName, {
                            [classes.folderNameSelected]: isSelected,
                            [classes.folderNameNotSelected]: !isSelected
                        })}
                    >
                        {icon}
                        {this.props.file.name}
                    </Typography>
                </TableCell>
                <TableCell className={classNames(classes.hideAuto,classes.tableRow)}>
                    <Typography
                        variant="body2"
                        className={classNames(classes.folderName, {
                            [classes.folderNameSelected]: isSelected,
                            [classes.folderNameNotSelected]: !isSelected
                        })}
                    >
                        {" "}
                        {this.props.file.type !== "dir" &&
                            sizeToString(this.props.file.size)}
                    </Typography>
                </TableCell>
                <TableCell className={classNames(classes.hideAuto,classes.tableRow)}>
                    <Typography
                        variant="body2"
                        className={classNames(classes.folderName, {
                            [classes.folderNameSelected]: isSelected,
                            [classes.folderNameNotSelected]: !isSelected
                        })}
                    >
                        {" "}
                        {this.props.file.date}
                    </Typography>
                </TableCell>
            </TableRow>
        );
    }
}

TableRowCompoment.propTypes = {
    classes: PropTypes.object.isRequired,
    file: PropTypes.object.isRequired
};

const TableItem = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(TableRowCompoment));

export default TableItem;
