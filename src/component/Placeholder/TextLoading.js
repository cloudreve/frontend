import React from "react";
import { Code } from "react-content-loader";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    loader: {
        width: "70%",
        padding: 40,
        [theme.breakpoints.down("md")]: {
            width: "100%",
            padding: 10
        }
    }
}));

const MyLoader = props => <Code className={props.className} />;

function TextLoading() {
    const classes = useStyles();

    return (
        <div>
            <MyLoader className={classes.loader} />
        </div>
    );
}

export default TextLoading;
