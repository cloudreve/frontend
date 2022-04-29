import Highlighter from "react-highlight-words";
import { trimPrefix } from "../Uploader/core/utils";
import React from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    highlight: {
        backgroundColor: theme.palette.warning.light,
    },
}));

export default function FileName({ name }) {
    const classes = useStyles();
    const search = useSelector((state) => state.explorer.search);
    if (!search) {
        return name;
    }

    return (
        <Highlighter
            highlightClassName={classes.highlight}
            searchWords={trimPrefix(search.keywords, "keywords/").split(" ")}
            autoEscape={true}
            textToHighlight={name}
        />
    );
}
