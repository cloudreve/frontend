import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useLocation, useParams, useRouteMatch } from "react-router";
import API from "../../middleware/Api";
import { useDispatch } from "react-redux";
import pathHelper from "../../utils/page";
import { toggleSnackbar } from "../../redux/explorer";
import UseFileSubTitle from "../../hooks/fileSubtitle";

const useStyles = makeStyles(() => ({
    layout: {
        width: "auto",
    },

    container: {
        border: "none",
        width: "100%",
        height: "calc(100vh - 64px)",
        marginBottom: -10,
    },
}));

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function DocViewer() {
    const [url, setURL] = useState("");
    const math = useRouteMatch();
    const location = useLocation();
    const query = useQuery();
    const { id } = useParams();
    UseFileSubTitle(query, math, location);

    const dispatch = useDispatch();

    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    useEffect(() => {
        let requestURL = "/file/doc/" + query.get("id");
        if (pathHelper.isSharePage(location.pathname)) {
            requestURL = "/share/doc/" + id;
            if (query.get("share_path") !== "") {
                requestURL +=
                    "?path=" + encodeURIComponent(query.get("share_path"));
            }
        }
        API.get(requestURL)
            .then((response) => {
                setURL(response.data);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
        // eslint-disable-next-line
    }, [math.params[0], location]);

    const classes = useStyles();
    return (
        <div className={classes.layout}>
            {url !== "" && (
                <iframe title={"ms"} className={classes.container} src={url} />
            )}
        </div>
    );
}
