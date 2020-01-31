import React, { useCallback, useEffect } from "react";
import DPlayer from "react-dplayer";
import { Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useLocation, useParams, useRouteMatch } from "react-router";
import { getBaseURL } from "../../middleware/Api";
import { useDispatch } from "react-redux";
import { changeSubTitle } from "../../actions";
import pathHelper from "../../untils/page";

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
        marginBottom: 50
    },
    player: {
        borderRadius: "4px"
    }
}));

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function VideoViewer(props) {
    const math = useRouteMatch();
    let location = useLocation();
    let query = useQuery();
    let { id } = useParams();
    const dispatch = useDispatch();
    const SetSubTitle = useCallback(title => dispatch(changeSubTitle(title)), [
        dispatch
    ]);
    useEffect(() => {
        if (!pathHelper.isSharePage(location.pathname)) {
            let path = math.params[0].split("/");
            SetSubTitle(path[path.length - 1]);
        } else {
            SetSubTitle(query.get("name"));
        }
    }, [math.params[0], location]);

    const classes = useStyles();
    return (
        <div className={classes.layout}>
            <Paper className={classes.root} elevation={1}>
                <DPlayer
                    className={classes.player}
                    options={{
                        video: {
                            url:
                                getBaseURL() +
                                (pathHelper.isSharePage(location.pathname)
                                    ? "/share/preview/" +
                                      id +
                                      (query.get("share_path") !== ""
                                          ? "?path=" +
                                            encodeURIComponent(
                                                query.get("share_path")
                                            )
                                          : "")
                                    : "/file/preview/" + math.params[0])
                        }
                    }}
                />
            </Paper>
        </div>
    );
}
