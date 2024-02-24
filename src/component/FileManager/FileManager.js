import React, { Component } from "react";

import Navigator from "./Navigator/Navigator";
import { DndProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import DragLayer from "./DnD/DragLayer";
import Explorer from "./Explorer";
import Modals from "./Modals";
import { connect } from "react-redux";
import { changeSubTitle } from "../../redux/viewUpdate/action";
import { withRouter } from "react-router-dom";
import pathHelper from "../../utils/page";
import SideDrawer from "./Sidebar/SideDrawer";
import classNames from "classnames";
//import { ImageLoader } from "@abslant/cd-image-loader";
import {
    closeAllModals,
    navigateTo,
    setSelectedTarget,
    toggleSnackbar,
} from "../../redux/explorer";
import PaginationFooter from "./Pagination";
import withStyles from "@material-ui/core/styles/withStyles";

const styles = (theme) => ({
    root: {
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px)",
        [theme.breakpoints.down("xs")]: {
            height: "100%",
        },
    },
    rootShare: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 500,
    },
    explorer: {
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
    },
});

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) => {
    return {
        changeSubTitle: (text) => {
            dispatch(changeSubTitle(text));
        },
        setSelectedTarget: (targets) => {
            dispatch(setSelectedTarget(targets));
        },
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
        },
        closeAllModals: () => {
            dispatch(closeAllModals());
        },
        navigateTo: (path) => {
            dispatch(navigateTo(path));
        },
    };
};

class FileManager extends Component {
    constructor(props) {
        super(props);
        this.image = React.createRef();
    }

    componentWillUnmount() {
        this.props.setSelectedTarget([]);
        this.props.closeAllModals();
        this.props.navigateTo("/");
    }

    componentDidMount() {
        if (pathHelper.isHomePage(this.props.location.pathname)) {
            this.props.changeSubTitle(null);
        }
    }

    render() {
        const { classes } = this.props;
        return (
            <div
                className={classNames({
                    [classes.rootShare]: this.props.share,
                    [classes.root]: !this.props.share,
                })}
            >
                <DndProvider backend={HTML5Backend}>
                    <Modals share={this.props.share} />
                    <Navigator
                        isShare={this.props.isShare}
                        share={this.props.share}
                    />
                    <div className={classes.explorer} id={"explorer-container"}>
                        <Explorer share={this.props.share} />
                        <PaginationFooter />
                    </div>

                    <DragLayer />
                </DndProvider>
                <SideDrawer />
            </div>
        );
    }
}

FileManager.propTypes = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(withRouter(FileManager)));
