import React from "react";
import { Facebook } from "react-content-loader";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    loader: {
        width: "80%",
        [theme.breakpoints.up("md")]: {
            width: " 50%"
        },

        marginTop: 30
    }
}));

const MyLoader = props => {
    return <Facebook className={props.className} />;
};

function PageLoading() {
    const classes = useStyles();

    return (
        <div
            style={{
                textAlign: "center"
            }}
        >
            <MyLoader className={classes.loader} />
        </div>
    );
}

export default PageLoading;
