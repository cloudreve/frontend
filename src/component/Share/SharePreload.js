import React, {Suspense, useCallback, useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import PageLoading from "../Placeholder/PageLoading";
import {useParams} from "react-router";
import API from "../../middleware/Api";
import {changeSubTitle, toggleSnackbar} from "../../actions";
import {useDispatch} from "react-redux";
import ShareNotFound from "./NotFound";
const useStyles = makeStyles({
});

export default function SharePreload(){
    const classes = useStyles();
    const dispatch = useDispatch();
    let { id } = useParams();

    const [share,setShare] = useState(undefined);

    const SetSubTitle = useCallback(title => dispatch(changeSubTitle(title)), [
        dispatch
    ]);

    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    useEffect(() => {
        API.get("/share/" + id)
            .then(response => {

            })
            .catch(error => {
                if (error.code ===404){
                    setShare(null);
                }else{
                    ToggleSnackbar(
                        "top",
                        "right",
                        error.message,
                        "error"
                    )
                }

            });
    }, [id]);

    return (

        <Suspense fallback={<PageLoading/>}>
            {share === undefined &&
                <PageLoading/>
            }
            {share === null &&
            <ShareNotFound/>
            }
        </Suspense>
    );
}