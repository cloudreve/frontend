import React, {useCallback, useEffect} from "react";
import DPlayer from "react-dplayer";
import { Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useRouteMatch } from "react-router";
import { getBaseURL } from "../../middleware/Api";
import {useDispatch} from "react-redux";
import {changeSubTitle} from "../../actions";

const useStyles = makeStyles(theme => ({
    layout: {
        width: "auto",
        marginTop: "30px",
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
            width: 1100,
            marginLeft: "auto",
            marginRight: "auto"
        },
        marginBottom:50,
    },
    player: {
        borderRadius: "4px"
    }
}));

export default function VideoViewer(props) {
    const math = useRouteMatch();
    const dispatch = useDispatch();
    const SetSubTitle = useCallback(
        title=>dispatch(changeSubTitle(title)),
        [dispatch]
    );
    useEffect(()=>{
        let path = math.params[0].split("/");
        SetSubTitle(path[path.length - 1]);
    },[math.params[0]]);

    const classes = useStyles();
    return (
        <div className={classes.layout}>
            <Paper className={classes.root} elevation={1}>
                <DPlayer
                    className={classes.player}
                    options={{
                        video: {url: getBaseURL() + "/file/preview/" + math.params[0]},
                    }}
                />
            </Paper>
        </div>
    );
}
