import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import UploadIcon from '@material-ui/icons/CloudUpload';
import List from '@material-ui/core/List';
const drawerWidth = 240;
const styles = theme => ({
    drawer: {
        [theme.breakpoints.up('sm')]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    drawerPaper: {
        width: drawerWidth,
    },
    toolbar: theme.mixins.toolbar,
});
class SideDrawer extends Component {

    state = {
        mobileOpen: false,
    };

    handleDrawerToggle = () => {
        this.setState(state => ({ mobileOpen: !state.mobileOpen }));
    };

    upload(){
        alert("");
    }   

    render() {
        const { classes } = this.props;
        
        const drawer = (
            <div><div className={classes.toolbar} />
                <List>
                    <ListItem button key="上传文d件" onClick={this.upload}>
                        <ListItemIcon><UploadIcon /></ListItemIcon>
                        <ListItemText primary="上传文d件" />
                    </ListItem>

                </List>
                <Divider />
                <List>

                </List></div>
        );

        return (
            <nav className={classes.drawer}>
                <Hidden smUp implementation="css">
                    <Drawer
                        container={this.props.container}
                        variant="temporary"
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                        open={this.state.mobileOpen}
                        onClose={this.handleDrawerToggle}
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        ModalProps={{
                            keepMounted: true, // Better open performance on mobile.
                        }}
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
                <Hidden xsDown implementation="css">
                    <Drawer
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        variant="permanent"
                        open
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
            </nav>
        );
    }

}
SideDrawer.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SideDrawer);