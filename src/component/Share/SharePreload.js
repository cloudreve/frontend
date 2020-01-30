import React, { Suspense, useCallback, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import PageLoading from "../Placeholder/PageLoading";
import { useParams } from "react-router";
import API from "../../middleware/Api";
import { changeSubTitle, toggleSnackbar } from "../../actions";
import { useDispatch } from "react-redux";
import ShareNotFound from "./NotFound";
import Grow from "@material-ui/core/Grow";
const useStyles = makeStyles({});

const LockedFile = React.lazy(() => import("./LockedFile"));
const SharedFile = React.lazy(() => import("./SharedFile"));
const SharedFolder = React.lazy(() => import("./SharedFolder"));

export default function SharePreload() {
    const classes = useStyles();
    const dispatch = useDispatch();
    let { id } = useParams();

    const [share, setShare] = useState(undefined);
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");

    const SetSubTitle = useCallback(title => dispatch(changeSubTitle(title)), [
        dispatch
    ]);

    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    useEffect(() => {
        if (share) {
            if (share.locked) {
                SetSubTitle(share.creator.nick + "的加密分享");
                if (password !== "") {
                    ToggleSnackbar("top", "right", "密码不正确", "warning");
                }
            } else {
                SetSubTitle(share.source.name);
            }
        } else {
            SetSubTitle();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [share,SetSubTitle,ToggleSnackbar]);

    useEffect(() => {
        return () => {
            SetSubTitle();
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        let withPassword = "";
        if (password !== "") {
            withPassword = "?password=" + password;
        }
        API.get("/share/info/" + id + withPassword)
            .then(response => {
                setShare(response.data);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                if (error.code === 404) {
                    setShare(null);
                } else {
                    ToggleSnackbar("top", "right", error.message, "error");
                }
            });
    }, [id, password,ToggleSnackbar]);

    return (
        <Suspense fallback={<PageLoading />}>
            {share === undefined && <PageLoading />}
            {share === null && <ShareNotFound />}
            {share && share.locked && (
                <LockedFile
                    loading={loading}
                    setPassowrd={setPassword}
                    share={share}
                />
            )}
            {share&&!share.locked&&!share.is_dir&&<SharedFile share={share}/>}
            {share&&!share.locked&&share.is_dir&&<SharedFolder share={share}/>}
        </Suspense>
    );
}
