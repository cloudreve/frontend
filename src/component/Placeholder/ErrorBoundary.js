import React from "react";
import { withStyles } from "@material-ui/core";
import { withTranslation } from "react-i18next";

const styles = {
    h1: {
        color: "#a4a4a4",
        margin: "5px 0px",
    },
    h2: {
        margin: "15px 0px",
    },
};

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo,
        });
    }

    render() {
        const { classes, t } = this.props;
        if (this.state.hasError) {
            return (
                <>
                    <h1 className={classes.h1}>:(</h1>
                    <h2 className={classes.h2}>{t("renderError")}</h2>
                    {this.state.error &&
                        this.state.errorInfo &&
                        this.state.errorInfo.componentStack && (
                            <details>
                                <summary>{t("errorDetails")}</summary>
                                <pre>
                                    <code>{this.state.error.toString()}</code>
                                </pre>
                                <pre>
                                    <code>
                                        {this.state.errorInfo.componentStack}
                                    </code>
                                </pre>
                            </details>
                        )}
                </>
            );
        }

        return this.props.children;
    }
}

export default withTranslation(["common"])(withStyles(styles)(ErrorBoundary));
