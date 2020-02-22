import React, {useCallback, useEffect, useState} from "react";
import { makeStyles } from "@material-ui/core/styles";
import {useLocation, useParams, useRouteMatch} from "react-router";
import API from "../../middleware/Api";
import {useDispatch} from "react-redux";
import {changeSubTitle, toggleSnackbar} from "../../actions";
import pathHelper from "../../untils/page";

const useStyles = makeStyles(theme => ({
    layout: {
        width: "auto",
        marginTop: "-48px",

    },

    container:{
        border:"none",
        width:"100%",
        height: "calc(100vh - 18px)",
        marginBottom: -3,
    }
}));

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function DocViewer(props) {
    let [url,setURL] = useState("");
    const math = useRouteMatch();
    let location = useLocation();
    let query = useQuery();
    let { id } = useParams();

    const dispatch = useDispatch();

    const SetSubTitle = useCallback(
        title=>dispatch(changeSubTitle(title)),
        [dispatch]
    );

    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    useEffect(() => {
        if (!pathHelper.isSharePage(location.pathname)) {
            let path = math.params[0].split("/");
            SetSubTitle(path[path.length - 1]);
        } else {
            SetSubTitle(query.get("name"));
        }
        // eslint-disable-next-line
    }, [math.params[0], location]);

    useEffect(()=>{
        let requestURL = "/file/doc/" + query.get("id");
        if (pathHelper.isSharePage(location.pathname)){
            requestURL = "/share/doc/" + id;
            if(query.get("share_path") !== ""){
                requestURL +=("?path=" +encodeURIComponent(query.get("share_path")))
            }
        }
        API.get(requestURL)
            .then(response => {
                setURL(response.data)
            })
            .catch(error => {
                ToggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                )
            });
        // eslint-disable-next-line
    },[math.params[0],location]);

    const classes = useStyles();
    return (
        <div className={classes.layout}>
            {url !== "" && <iframe title={"ms"} className={classes.container} src={url} />}
        </div>
    );
}
