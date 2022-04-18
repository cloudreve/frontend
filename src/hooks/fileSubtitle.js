import { useDispatch } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { changeSubTitle } from "../redux/viewUpdate/action";
import pathHelper from "../utils/page";

export default function UseFileSubTitle(query, math, location) {
    const dispatch = useDispatch();
    const [title, setTitle] = useState("");
    const [path, setPath] = useState("");
    const SetSubTitle = useCallback(
        (title) => dispatch(changeSubTitle(title)),
        [dispatch]
    );

    useEffect(() => {
        if (!pathHelper.isSharePage(location.pathname)) {
            const path = query.get("p").split("/");
            setPath(query.get("p"));
            SetSubTitle(path[path.length - 1]);
            setTitle(path[path.length - 1]);
        } else {
            SetSubTitle(query.get("name"));
            setTitle(query.get("name"));
            setPath(query.get("share_path"));
        }
        // eslint-disable-next-line
    }, [math.params[0], location]);

    return { title, path };
}
