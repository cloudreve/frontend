import React, {useState} from "react";
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import UserAvatar from "../Navbar/UserAvatar";
import {Home, Settings} from "@material-ui/icons";
import {withStyles} from "@material-ui/core";
import MuiExpansionPanel from "@material-ui/core/ExpansionPanel";
import MuiExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import MuiExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import {useHistory} from "react-router";
import {useRouteMatch} from "react-router-dom";

const ExpansionPanel = withStyles({
    root: {
        maxWidth: "100%",
        boxShadow: "none",
        "&:not(:last-child)": {
            borderBottom: 0
        },
        "&:before": {
            display: "none"
        },
        "&$expanded": { margin: 0 }
    },
    expanded: {}
})(MuiExpansionPanel);

const ExpansionPanelSummary = withStyles({
    root: {
        minHeight: 0,
        padding: 0,

        "&$expanded": {
            minHeight: 0
        }
    },
    content: {
        maxWidth: "100%",
        margin: 0,
        display: "block",
        "&$expanded": {
            margin: "0"
        }
    },
    expanded: {}
})(MuiExpansionPanelSummary);

const ExpansionPanelDetails = withStyles(theme => ({
    root: {
        display: "block",
        padding: theme.spacing(0)
    }
}))(MuiExpansionPanelDetails);

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        width: "100%"
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: 36,
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    drawerOpen: {
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: theme.spacing(7) + 1,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9) + 1,
        },
    },
    title:{
        flexGrow: 1,
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 1),
        ...theme.mixins.toolbar,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    sub:{
        paddingLeft: 36,
        color:theme.palette.text.secondary,
    },
    subMenu:{
        backgroundColor:theme.palette.background.default,
    }
}));

const items = [
    {
        title:"面板首页",
        icon: (<Home/>),
        path:"",
    },
    {
        title:"参数设置",
        icon: (<Settings/>),
        sub:[
            {
                title:"基本",
                path:"basic",
                icon: (<Settings/>),
            },
            {
                title:"基本2",
                path:"basic",
                icon: (<Settings/>),
            },
        ],
    },
];


export default  function Dashboard({content}){
    const classes = useStyles();
    const theme = useTheme();
    const [open, setOpen] = useState(true);
    const [menuOpen,setMenuOpen] = useState(null);
    const history = useHistory();

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    let { path } = useRouteMatch();

    return (
        <div className={classes.root}>
            <AppBar
                position="fixed"
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: open,
                })}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        className={clsx(classes.menuButton, {
                            [classes.hide]: open,
                        })}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" className={classes.title} noWrap>
                        Cloudreve 仪表盘
                    </Typography>
                    <UserAvatar />
                </Toolbar>

            </AppBar>
            <Drawer
                variant="permanent"
                className={clsx(classes.drawer, {
                    [classes.drawerOpen]: open,
                    [classes.drawerClose]: !open,
                })}
                classes={{
                    paper: clsx({
                        [classes.drawerOpen]: open,
                        [classes.drawerClose]: !open,
                    }),
                }}
            >
                <div className={classes.toolbar}>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                </div>
                <Divider />
                <List>
                    {items.map(item=> {
                        if (item.path !== undefined){
                            return (
                                <ListItem  onClick={()=>history.push("/admin/"+item.path)} button key={item.title}>
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.title}/>
                                </ListItem>
                            );
                        }
                        return (
                            <ExpansionPanel
                                square
                                expanded={menuOpen === item.title}
                                onChange={(event, isExpanded) => {
                                    setMenuOpen(isExpanded ? item.title : null);
                                }}
                            >
                                <ExpansionPanelSummary
                                    aria-controls="panel1d-content"
                                    id="panel1d-header"
                                >
                                    <ListItem button key={item.title}>
                                        <ListItemIcon>{item.icon}</ListItemIcon>
                                        <ListItemText primary={item.title}/>
                                    </ListItem>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails>
                                    <List className={classes.subMenu}>
                                        {item.sub.map(sub=>(
                                            <ListItem
                                                onClick={()=>history.push("/admin/"+sub.path)}
                                                className={clsx({
                                                    [classes.sub]: open,
                                                })}

                                                button key={sub.title}>
                                                <ListItemIcon>{sub.icon}</ListItemIcon>
                                                <ListItemText primary={sub.title}/>
                                            </ListItem>
                                        ))}
                                    </List>
                                </ExpansionPanelDetails>
                            </ExpansionPanel>
                        )
                    })}
                </List>

            </Drawer>
            <main
                className={classes.content}
            >
                <div className={classes.toolbar} />
                {content(path)}
            </main>
        </div>
    );
}