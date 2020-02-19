import React, { useCallback, useState, useEffect } from "react";
import {useDispatch} from "react-redux";
import {toggleSnackbar} from "../../actions";
import Notice from "../Share/NotFound";
import {useHistory, useLocation} from "react-router";
import API from "../../middleware/Api";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}


export default function QQCallback(props){
    let query = useQuery();
    let location = useLocation();
    let history = useHistory();
    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const [msg,setMsg] = useState("");

    useEffect(()=>{
        if(query.get("error_description")){
            setMsg(query.get("error_description"));
            return
        }
        API.post("/callback/qq",{
            code:query.get("code"),
            state:query.get("state"),
        })
            .then(response => {
                history.push(response.data);
            })
            .catch(error => {
                setMsg(error.message);
            });
    },[location]);

    return (
        <>
            {msg !== "" && <Notice msg={msg}/>}
        </>
    )
}