import React, { Suspense, useCallback, useMemo, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useLocation, useParams, useRouteMatch } from "react-router";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../redux/explorer";
import UseFileSubTitle from "../../hooks/fileSubtitle";
import { getPreviewURL } from "../../middleware/Api";
import pathHelper from "../../utils/page";
import TextLoading from "../Placeholder/TextLoading";

const ReactReader = React.lazy(() =>
    import(/* webpackChunkName: "ReactReader" */ "react-reader").then((m) => ({
        default: m.ReactReader,
    }))
);

const useStyles = makeStyles((theme) => ({
    layout: {
        height: "calc(100vh - 64px)",
    },
    paper: {
        marginBottom: theme.spacing(3),
    },
}));

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function EpubViewer() {
    const math = useRouteMatch();
    const location = useLocation();
    const query = useQuery();
    const { id } = useParams();
    const { path } = UseFileSubTitle(query, math, location);
    const isShare = pathHelper.isSharePage(location.pathname);

    const [currentLocation, setLocation] = useState(null);
    const locationChanged = (epubcifi) => {
        setLocation(epubcifi);
    };

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const fileUrl = useMemo(
        () =>
            getPreviewURL(
                isShare,
                id,
                query.get("id"),
                query.get("share_path")
            ),
        [id, location, path]
    );

    const classes = useStyles();
    return (
        <div className={classes.layout}>
            <Suspense fallback={<TextLoading />}>
                <ReactReader
                    location={currentLocation}
                    locationChanged={locationChanged}
                    epubInitOptions={{
                        openAs: "epub",
                    }}
                    showToc={false}
                    className={classes.container}
                    url={fileUrl}
                />
            </Suspense>
        </div>
    );
}
