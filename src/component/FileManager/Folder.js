import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { connect } from 'react-redux'

import FolderIcon from '@material-ui/icons/Folder'
import classNames from 'classnames';
import { withStyles, ButtonBase, Typography, Tooltip } from '@material-ui/core';

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
        height: "50px",
        border: "1px solid #dadce0",
        width: "100%",
        borderRadius: "6px",
        boxSizing: "border-box",
        transition: "background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
        display: "flex",
        justifyContent: "left",
        alignItems: "initial",
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


class FolderCompoment extends Component {

    state = {
    }


    render() {

        const { classes } = this.props;

        const isSelected = (this.props.selected.findIndex((value) => {
            return value === this.props.folder;
        })) !== -1;

        return (
                <ButtonBase
                    focusRipple
                    className={classNames({
                        [classes.selected]: isSelected,
                        [classes.notSelected]: !isSelected,
                    }, classes.button)}
                >
                    <div className={classNames(classes.icon, {
                        [classes.iconSelected]: isSelected,
                        [classes.iconNotSelected]: !isSelected,
                    })}><FolderIcon /></div>
                    <Tooltip title={this.props.folder.name} aria-label={this.props.folder.name}>
                        <Typography className={classNames(classes.folderName, {
                            [classes.folderNameSelected]: isSelected,
                            [classes.folderNameNotSelected]: !isSelected,
                        })}>{this.props.folder.name}</Typography>
                    </Tooltip>
                </ButtonBase>
        );
    }
}

FolderCompoment.propTypes = {
    classes: PropTypes.object.isRequired,
    folder: PropTypes.object.isRequired,
};


const Folder = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(FolderCompoment))

export default Folder