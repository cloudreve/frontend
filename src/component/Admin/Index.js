import React, {useCallback, useEffect, useState} from "react";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import ResponsiveContainer from "recharts/lib/component/ResponsiveContainer";
import {makeStyles} from "@material-ui/core/styles";
import pathHelper from "../../untils/page";
import API from "../../middleware/Api";
import {useDispatch} from "react-redux";
import {changeSubTitle, toggleSnackbar} from "../../actions";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import {Forum, GitHub, Home, Launch, People, Telegram} from "@material-ui/icons";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";

const useStyles = makeStyles(theme => ({
    paper:{
        padding:theme.spacing(3),
        height: "100%",
    },
    logo:{
        width:70,
    },
    logoContainer:{
        padding:theme.spacing(3),
        display:"flex",
    },
    title:{
        marginLeft:16,
    },
    cloudreve:{
        fontSize:25,
        color:theme.palette.text.secondary,
    },
    version:{
        color:theme.palette.text.hint,
    },
    links:{
        padding:theme.spacing(3),
    },
    iconRight:{
        minWidth:0,
    }
}));

export default function Index() {
    const classes = useStyles();
    const [lineData,setLineData] = useState([]);
    const [statistics,setStatistics] = useState({
        fileTotal:0,
        userTotal:0,
        publicShareTotal:0,
        secretShareTotal:0,
    });
    const [version,setVersion] = useState({
        backend:"-",
    });

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    useEffect(()=>{
        API.get("/admin/summary").then(response => {
            let data = [];
            response.data.date.forEach((v,k)=>{
                data.push({
                    name:v,
                    file:response.data.files[k],
                    user:response.data.users[k],
                    share:response.data.shares[k],
                })
            })
            setLineData(data);
            setStatistics({
                fileTotal:response.data.fileTotal,
                userTotal:response.data.userTotal,
                publicShareTotal:response.data.publicShareTotal,
                secretShareTotal:response.data.secretShareTotal,
            });
            setVersion(response.data.version);
        })
            .catch(error => {
                ToggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                )
            });
    },[]);

    return <Grid container spacing={3}>
        <Grid alignContent={"stretch"} item xs={12} md={8} lg={9}>
            <Paper className={classes.paper}>
                <Typography variant="button" display="block" gutterBottom>
                趋势
                </Typography>
                <ResponsiveContainer width='100%' aspect={pathHelper.isMobile()?4.0/3.0:3.0/1.0}>
                <LineChart
                    width={1200}
                    height={300}
                    data={lineData}

                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line name={"文件"} type="monotone" dataKey="file" stroke="#3f51b5"/>
                    <Line name={"用户"} type="monotone" dataKey="user" stroke="#82ca9d"  />
                    <Line name={"分享"} type="monotone" dataKey="share" stroke="#e91e63" />
                </LineChart>
                </ResponsiveContainer>
            </Paper>
        </Grid>
        <Grid  item xs={12} md={4} lg={3}>
            <Paper className={classes.paper}>
                <Typography variant="button" display="block" gutterBottom>
                总计

                </Typography><Divider/>
                <List className={classes.root}>
                    <ListItem>
                        <ListItemAvatar>
                            <Avatar>
                                <People />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={statistics.userTotal} secondary="注册用户" />
                    </ListItem>
                    <ListItem>
                        <ListItemAvatar>
                            <Avatar>
                                <People />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={statistics.fileTotal} secondary="文件总数" />
                    </ListItem>
                    <ListItem>
                        <ListItemAvatar>
                            <Avatar>
                                <People />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={statistics.publicShareTotal} secondary="公开分享总数" />
                    </ListItem>
                    <ListItem>
                        <ListItemAvatar>
                            <Avatar>
                                <People />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={statistics.secretShareTotal} secondary="私密分享总数" />
                    </ListItem>
                </List>
            </Paper>
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
            <Paper>
                <div className={classes.logoContainer}>
                    <img className={classes.logo} src={"/static/img/cloudreve.svg"}/>
                    <div className={classes.title}>
                        <Typography className={classes.cloudreve}>Cloudreve</Typography>
                        <Typography className={classes.version}>{version.backend}</Typography>
                    </div>
                </div>
                <Divider/>
                <div >
                    <List component="nav" aria-label="main mailbox folders">
                        <ListItem button onClick={()=>window.open("https://cloudreve.org")}>
                            <ListItemIcon>
                                <Home />
                            </ListItemIcon>
                            <ListItemText primary="主页" />
                            <ListItemIcon className={classes.iconRight}>
                                <Launch />
                            </ListItemIcon>
                        </ListItem>
                        <ListItem button onClick={()=>window.open("https://github.com/cloudreve/cloudreve")}>
                            <ListItemIcon>
                                <GitHub />
                            </ListItemIcon>
                            <ListItemText primary="GitHub" />
                            <ListItemIcon className={classes.iconRight}>
                                <Launch />
                            </ListItemIcon>
                        </ListItem>
                        <ListItem button onClick={()=>window.open("https://forum.cloudreve.org")}>
                            <ListItemIcon>
                                <Forum />
                            </ListItemIcon>
                            <ListItemText primary="讨论社区" />
                            <ListItemIcon className={classes.iconRight}>
                                <Launch />
                            </ListItemIcon>
                        </ListItem>
                        <ListItem button onClick={()=>window.open("https://t.me/cloudreve_official")}>
                            <ListItemIcon>
                                <Telegram />
                            </ListItemIcon>
                            <ListItemText primary="Telegram 群组" />
                            <ListItemIcon className={classes.iconRight}>
                                <Launch />
                            </ListItemIcon>
                        </ListItem>
                    </List>
                </div>
            </Paper>
        </Grid>
        <Grid item xs={12} md={8} lg={9}>
            <Paper className={classes.paper}>
            </Paper>
        </Grid>
    </Grid>;
}
