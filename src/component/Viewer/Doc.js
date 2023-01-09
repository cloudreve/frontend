import React, { useCallback, useEffect, useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { useLocation, useParams, useRouteMatch } from "react-router";
import API from "../../middleware/Api";
import { useDispatch, useSelector } from "react-redux";
import pathHelper from "../../utils/page";
import {
    closeAllModals,
    openShareDialog,
    setModalsLoading,
    setSelectedTarget,
    toggleSnackbar,
} from "../../redux/explorer";
import UseFileSubTitle from "../../hooks/fileSubtitle";
import i18n from "i18next";
import CreatShare from "../Modals/CreateShare";

const useStyles = makeStyles(() => ({
    layout: {
        width: "auto",
    },
    "@global": {
        iframe: {
            border: "none",
            width: "100%",
            height: "calc(100vh - 64px)",
            marginBottom: -10,
        },
    },
}));

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function DocViewer() {
    const [session, setSession] = useState(null);
    const [file, setFile] = useState(null);
    const math = useRouteMatch();
    const location = useLocation();
    const query = useQuery();
    const { id } = useParams();
    const theme = useTheme();
    const { title } = UseFileSubTitle(query, math, location);

    const shareOpened = useSelector((state) => state.viewUpdate.modals.share);
    const modalLoading = useSelector((state) => state.viewUpdate.modalsLoading);
    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );
    const CloseAllModals = useCallback(
        () => dispatch(closeAllModals()),
        [dispatch]
    );
    const OpenShareDialog = useCallback(
        () => dispatch(openShareDialog()),
        [dispatch]
    );
    const SetModalsLoading = useCallback(
        (status) => dispatch(setModalsLoading(status)),
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
                if (response.data.access_token) {
                    response.data.url = response.data.url.replaceAll(
                        "lng",
                        i18n.resolvedLanguage.toLowerCase()
                    );
                    response.data.url = response.data.url.replaceAll(
                        "darkmode",
                        theme.palette.type === "dark" ? "2" : "1"
                    );
                }

                setSession(response.data);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
        // eslint-disable-next-line
    }, [math.params[0], location]);

    const classes = useStyles();

    const handlePostMessage = (e) => {
        console.log("Received PostMessage from " + e.origin, e.data);
        let msg;
        try {
            msg = JSON.parse(e.data);
        } catch (e) {
            return;
        }

        if (msg.MessageId === "UI_Sharing") {
            setFile([
                {
                    name: title,
                    id: query.get("id"),
                    type: "file",
                },
            ]);
            OpenShareDialog();
        }
    };

    useEffect(() => {
        const frameholder = document.getElementById("frameholder");
        const office_frame = document.createElement("iframe");
        if (session && session.access_token && frameholder) {
            office_frame.name = "office_frame";
            office_frame.id = "office_frame";

            // The title should be set for accessibility
            office_frame.title = "Office Frame";

            // This attribute allows true fullscreen mode in slideshow view
            // when using PowerPoint's 'view' action.
            office_frame.setAttribute("allowfullscreen", "true");

            // The sandbox attribute is needed to allow automatic redirection to the O365 sign-in page in the business user flow
            office_frame.setAttribute(
                "sandbox",
                "allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation allow-popups-to-escape-sandbox"
            );
            frameholder.appendChild(office_frame);
            document.getElementById("office_form").submit();
            window.addEventListener("message", handlePostMessage, false);

            return () => {
                window.removeEventListener("message", handlePostMessage, false);
            };
        }
    }, [session]);

    return (
        <div className={classes.layout}>
            <CreatShare
                open={shareOpened}
                onClose={() => CloseAllModals()}
                modalsLoading={modalLoading}
                setModalsLoading={SetModalsLoading}
                selected={file}
            />
            {session && !session.access_token && (
                <iframe title={"ms"} src={session.url} />
            )}
            {session && session.access_token && (
                <>
                    <form
                        id="office_form"
                        name="office_form"
                        target="office_frame"
                        action={session.url}
                        method="post"
                    >
                        <input
                            name="access_token"
                            value={session.access_token}
                            type="hidden"
                        />
                        <input
                            name="access_token_ttl"
                            value={session.access_token_ttl}
                            type="hidden"
                        />
                    </form>
                    <span id="frameholder"></span>
                </>
            )}
        </div>
    );
}
