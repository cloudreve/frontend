import React, { Component } from "react";
import PropTypes from "prop-types";
import SearchIcon from "@material-ui/icons/Search";
import { fade } from "@material-ui/core/styles/colorManipulator";
import FileIcon from "@material-ui/icons/InsertDriveFile";
import ShareIcon from "@material-ui/icons/Share";
import { connect } from "react-redux";

import {
    Fade,
    InputBase,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Paper,
    Popper,
    Typography,
    withStyles,
} from "@material-ui/core";
import { withRouter } from "react-router";
import pathHelper from "../../utils/page";
import { configure, HotKeys } from "react-hotkeys";
import { searchMyFile } from "../../redux/explorer";
import FolderIcon from "@material-ui/icons/Folder";
import { Trans, withTranslation } from "react-i18next";

configure({
    ignoreTags: [],
});

const mapStateToProps = (state) => {
    return {
        path: state.navigator.path,
        search: state.explorer.search,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        searchMyFile: (keywords, path) => {
            dispatch(searchMyFile(keywords, path));
        },
    };
};

const styles = (theme) => ({
    search: {
        [theme.breakpoints.down("sm")]: {
            display: "none",
        },
        position: "relative",
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        "&:hover": {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginRight: theme.spacing(2),
        marginLeft: 0,
        width: "100%",
        [theme.breakpoints.up("sm")]: {
            marginLeft: theme.spacing(7.2),
            width: "auto",
        },
    },
    searchIcon: {
        width: theme.spacing(9),
        height: "100%",
        position: "absolute",
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    inputRoot: {
        color: "inherit",
        width: "100%",
    },
    inputInput: {
        paddingTop: theme.spacing(1),
        paddingRight: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        paddingLeft: theme.spacing(7),
        transition: theme.transitions.create("width"),
        width: "100%",
        [theme.breakpoints.up("md")]: {
            width: 200,
            "&:focus": {
                width: 300,
            },
        },
    },
    suggestBox: {
        zIndex: "9999",
        width: 364,
    },
});

const keyMap = {
    SEARCH: "enter",
};

class SearchBarCompoment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null,
            input: "",
        };
    }

    handlers = {
        SEARCH: (e) => {
            if (pathHelper.isHomePage(this.props.location.pathname)) {
                this.searchMyFile("")();
            } else {
                this.searchShare();
            }
            e.target.blur();
        },
    };

    handleChange = (event) => {
        const { currentTarget } = event;
        this.input = event.target.value;
        this.setState({
            anchorEl: currentTarget,
            input: event.target.value,
        });
    };

    cancelSuggest = () => {
        this.setState({
            input: "",
        });
    };

    searchMyFile = (path) => () => {
        this.props.searchMyFile("keywords/" + this.input, path);
    };

    searchShare = () => {
        this.props.history.push(
            "/search?keywords=" + encodeURIComponent(this.input)
        );
    };

    render() {
        const { classes, t } = this.props;
        const { anchorEl } = this.state;
        const id = this.state.input !== "" ? "simple-popper" : null;
        const isHomePage = pathHelper.isHomePage(this.props.location.pathname);

        return (
            <div className={classes.search}>
                <div className={classes.searchIcon}>
                    <SearchIcon />
                </div>
                <HotKeys keyMap={keyMap} handlers={this.handlers}>
                    <InputBase
                        placeholder={t("navbar.searchPlaceholder")}
                        classes={{
                            root: classes.inputRoot,
                            input: classes.inputInput,
                        }}
                        onChange={this.handleChange}
                        onBlur={this.cancelSuggest}
                        value={this.state.input}
                    />
                </HotKeys>
                <Popper
                    id={id}
                    open={this.state.input !== ""}
                    anchorEl={anchorEl}
                    className={classes.suggestBox}
                    transition
                >
                    {({ TransitionProps }) => (
                        <Fade {...TransitionProps} timeout={350}>
                            <Paper square={true}>
                                {isHomePage && (
                                    <MenuItem onClick={this.searchMyFile("")}>
                                        <ListItemIcon className={classes.icon}>
                                            <FileIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            classes={{
                                                primary: classes.primary,
                                            }}
                                            primary={
                                                <Typography noWrap>
                                                    <Trans
                                                        i18nKey="navbar.searchInFiles"
                                                        values={{
                                                            name: this.state
                                                                .input,
                                                        }}
                                                        components={[
                                                            <strong key={0} />,
                                                        ]}
                                                    />
                                                </Typography>
                                            }
                                        />
                                    </MenuItem>
                                )}

                                {isHomePage &&
                                    this.props.path !== "/" &&
                                    !this.props.search && (
                                        <MenuItem
                                            onClick={this.searchMyFile(
                                                this.props.path
                                            )}
                                        >
                                            <ListItemIcon
                                                className={classes.icon}
                                            >
                                                <FolderIcon />
                                            </ListItemIcon>
                                            <ListItemText
                                                classes={{
                                                    primary: classes.primary,
                                                }}
                                                primary={
                                                    <Typography noWrap>
                                                        <Trans
                                                            i18nKey="navbar.searchInFolders"
                                                            values={{
                                                                name: this.state
                                                                    .input,
                                                            }}
                                                            components={[
                                                                <strong
                                                                    key={0}
                                                                />,
                                                            ]}
                                                        />
                                                    </Typography>
                                                }
                                            />
                                        </MenuItem>
                                    )}

                                <MenuItem onClick={this.searchShare}>
                                    <ListItemIcon className={classes.icon}>
                                        <ShareIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        classes={{ primary: classes.primary }}
                                        primary={
                                            <Typography noWrap>
                                                <Trans
                                                    i18nKey="navbar.searchInShares"
                                                    values={{
                                                        name: this.state.input,
                                                    }}
                                                    components={[
                                                        <strong key={0} />,
                                                    ]}
                                                />
                                            </Typography>
                                        }
                                    />
                                </MenuItem>
                            </Paper>
                        </Fade>
                    )}
                </Popper>
            </div>
        );
    }
}

SearchBarCompoment.propTypes = {
    classes: PropTypes.object.isRequired,
};

const SearchBar = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(withRouter(withTranslation()(SearchBarCompoment))));

export default SearchBar;
