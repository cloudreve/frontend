import { withTranslation } from "react-i18next";
import React from "react";
import { withStyles } from "@material-ui/core";

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
        // 更新 state 使下一次渲染能够显示降级后的 UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo,
        });
    }

    render() {
        const { classes } = this.props;
        if (this.state.hasError) {
            // 你可以自定义降级后的 UI 并渲染
            return <>
                <h1 className={classes.h1}>:(</h1>
                <h2 className={classes.h2}>
                  {this.props.t('There was an error in page rendering, please try to refresh this page.')}
                </h2>
                {this.state.error &&
                    this.state.errorInfo &&
                    this.state.errorInfo.componentStack && (
                        <details>
                            <summary>{this.props.t('Error details')}</summary>
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
            </>;
        }

        return this.props.children;
    }
}

export default withTranslation()(withStyles(styles)(ErrorBoundary));
