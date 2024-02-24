import React, { Component } from "react";
import PropTypes from "prop-types";
import FolderIcon from "@material-ui/icons/Folder";
import RightIcon from "@material-ui/icons/KeyboardArrowRight";
import UpIcon from "@material-ui/icons/ArrowUpward";
import { connect } from "react-redux";
import classNames from "classnames";

import {
    IconButton,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    MenuItem,
    MenuList,
    withStyles,
} from "@material-ui/core";
import Sort, { sortMethodFuncs } from './Sort';
import API from "../../middleware/Api";
import { toggleSnackbar } from "../../redux/explorer";
import { withTranslation } from "react-i18next";

const mapStateToProps = (state) => {
    return {
        search: state.explorer.search,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
        },
    };
};

const styles = (theme) => ({
    iconWhite: {
        color: theme.palette.common.white,
    },
    selected: {
        backgroundColor: theme.palette.primary.main + "!important",
        "& $primary, & $icon": {
            color: theme.palette.common.white,
        },
    },
    primary: {},
    icon: {},
    buttonIcon: {},
    selector: {
        minWidth: "300px",
    },
    container: {
        maxHeight: "330px",
        overflowY: " auto",
    },
    sortWrapper: {
        textAlign: "right",
        paddingRight: "30px",
    },
    sortButton: {
        padding: "0",
    },
});

class PathSelectorCompoment extends Component {
    state = {
        presentPath: "/",
        sortBy: '',
        dirList: [],
        selectedTarget: null,
    };
    /**
     * the source dir list from api `/directory`
     *
     * `state.dirList` is a sorted copy of it
     */
    sourceDirList = []

    componentDidMount = () => {
        const toBeLoad = this.props.presentPath;
        this.enterFolder(!this.props.search ? toBeLoad : "/");
    };

    back = () => {
        const paths = this.state.presentPath.split("/");
        paths.pop();
        const toBeLoad = paths.join("/");
        this.enterFolder(toBeLoad === "" ? "/" : toBeLoad);
    };

    enterFolder = (toBeLoad) => {
        API.get(
            (this.props.api ? this.props.api : "/directory") +
                encodeURIComponent(toBeLoad)
        )
            .then((response) => {
                const dirList = response.data.objects.filter((x) => {
                    return (
                        x.type === "dir" &&
                        this.props.selected.findIndex((value) => {
                            return (
                                value.name === x.name && value.path === x.path
                            );
                        }) === -1
                    );
                });
                dirList.forEach((value) => {
                    value.displayName = value.name;
                });
                this.sourceDirList = dirList
                this.setState({
                    presentPath: toBeLoad,
                    dirList: dirList,
                    selectedTarget: null,
                }, this.updateDirList);
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "warning"
                );
            });
    };

    handleSelect = (index) => {
        this.setState({ selectedTarget: index });
        this.props.onSelect(this.state.dirList[index]);
    };


    /**
     * change sort type
     * @param {Event} event
     */
    onChangeSort = (sortBy) => {
        this.setState({ sortBy }, this.updateDirList)
    };
    
    /**
     * sort dir list, and handle parent dirs
     */
    updateDirList = () => {
        const { state, sourceDirList } = this
        const { sortBy, presentPath } = state

        // copy
        const dirList = [...sourceDirList]
        // sort
        const sortMethod = sortMethodFuncs[sortBy]
        if (sortMethod) dirList.sort(sortMethod)

        // add root/parent dirs to top
        if (presentPath === "/") {
            dirList.unshift({ name: "/", path: "", displayName: "/" });
        } else {
            let path = presentPath;
            let name = presentPath;
            const displayNames = ["fileManager.currentFolder", "fileManager.backToParentFolder"];
            for (let i = 0; i < 2; i++) {
                const paths = path.split("/");
                name = paths.pop();
                name = name === "" ? "/" : name;
                path = paths.join("/");
                dirList.unshift({
                    name: name,
                    path: path,
                    displayName: this.props.t(
                        displayNames[i]
                    ),
                });
            }
        }
        this.setState({ dirList })
    }
    render() {
        const { classes, t } = this.props;

        const showActionIcon = (index) => {
            if (this.state.presentPath === "/") {
                return index !== 0;
            }
            return index !== 1;
        };

        const actionIcon = (index) => {
            if (this.state.presentPath === "/") {
                return <RightIcon />;
            }

            if (index === 0) {
                return <UpIcon />;
            }
            return <RightIcon />;
        };

        return (
            <div className={classes.container}>
                <div className={classes.sortWrapper}>
                    <Sort value={this.state.sortBy} isSmall className={classes.sortButton} onChange={this.onChangeSort} />
                </div>
                <MenuList className={classes.selector}>
                    {this.state.dirList.map((value, index) => (
                        <MenuItem
                            classes={{
                                selected: classes.selected,
                            }}
                            key={index}
                            selected={this.state.selectedTarget === index}
                            onClick={() => this.handleSelect(index)}
                        >
                            <ListItemIcon className={classes.icon}>
                                <FolderIcon />
                            </ListItemIcon>
                            <ListItemText
                                classes={{ primary: classes.primary }}
                                primary={value.displayName}
                                primaryTypographyProps={{
                                    style: { whiteSpace: "normal" },
                                }}
                            />
                            {showActionIcon(index) && (
                                <ListItemSecondaryAction
                                    className={classes.buttonIcon}
                                >
                                    <IconButton
                                        className={classNames({
                                            [classes.iconWhite]:
                                                this.state.selectedTarget ===
                                                index,
                                        })}
                                        onClick={() =>
                                            index === 0
                                                ? this.back()
                                                : this.enterFolder(
                                                      value.path === "/"
                                                          ? value.path +
                                                                value.name
                                                          : value.path +
                                                                "/" +
                                                                value.name
                                                  )
                                        }
                                    >
                                        {actionIcon(index)}
                                    </IconButton>
                                </ListItemSecondaryAction>
                            )}
                        </MenuItem>
                    ))}
                </MenuList>
            </div>
        );
    }
}

PathSelectorCompoment.propTypes = {
    classes: PropTypes.object.isRequired,
    presentPath: PropTypes.string.isRequired,
    selected: PropTypes.array.isRequired,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(withTranslation()(PathSelectorCompoment)));
