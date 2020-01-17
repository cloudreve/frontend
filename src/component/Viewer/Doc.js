import React, {useCallback, useEffect, useState} from "react";
import { Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useRouteMatch } from "react-router";
import API from "../../middleware/Api";
import {useDispatch} from "react-redux";
import {changeSubTitle, toggleSnackbar} from "../../actions";

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

export default function DocViewer(props) {
    let [url,setURL] = useState("");
    const math = useRouteMatch();

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

    useEffect(()=>{
        let path = math.params[0].split("/");
        SetSubTitle(path[path.length - 1]);
    },[math.params[0]]);

    useEffect(()=>{
        API.get("/file/doc/" + math.params[0])
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
    },[math.params[0]]);

    const classes = useStyles();
    return (
        <div className={classes.layout}>
            {url !== "" && <iframe className={classes.container} src={url} />}
        </div>
    );
}
