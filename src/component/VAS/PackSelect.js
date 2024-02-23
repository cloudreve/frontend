import React, { Component } from "react";
import classNames from "classnames";
import { ButtonBase, Typography, withStyles } from "@material-ui/core";
import { withTranslation } from "react-i18next";

const styles = (theme) => ({
    container: {
        boxShadow: "0 0 0 1px #e6e9eb",
        borderRadius: theme.shape.borderRadius,
        transition: "box-shadow .5s",
        width: "100%",
        display: "block",
    },
    active: {
        boxShadow: "0 0 0 3px " + theme.palette.primary.main,
    },
    boxHead: {
        textAlign: "center",
        padding: "10px 10px 10px",
        borderBottom: "1px solid #e6e9eb",
        color: theme.palette.text.main,
        width: "100%",
    },
    price: {
        fontSize: "33px",
        fontWeight: "500",
        lineHeight: "40px",
        color: theme.palette.primary.main,
    },
    priceWithScore: {
        fontSize: "23px",
        fontWeight: "500",
        lineHeight: "40px",
        color: theme.palette.primary.main,
    },
    packName: {
        marginTop: "5px",
        marginBottom: "5px",
    },
    boxBottom: {
        color: theme.palette.text.main,
        textAlign: "center",
        padding: "5px",
    },
});

class PackSelect extends Component {
    render() {
        const { classes, pack, t } = this.props;
        return (
            <ButtonBase
                className={classNames(classes.container, {
                    [classes.active]: this.props.active,
                })}
                onClick={this.props.onSelect}
            >
                <div className={classes.boxHead}>
                    <Typography
                        variant="subtitle1"
                        className={classes.packName}
                    >
                        {pack.name}
                    </Typography>
                    {pack.score === 0 && (
                        <Typography className={classes.price}>
                            ￥{(pack.price / 100).toFixed(2)}
                        </Typography>
                    )}
                    {pack.score !== 0 && (
                        <Typography className={classes.priceWithScore}>
                            ￥{(pack.price / 100).toFixed(2)} /
                            {t("vas.creditsTotalNum", {
                                num: pack.score,
                            })}
                        </Typography>
                    )}
                </div>
                <div className={classes.boxBottom}>
                    <Typography>
                        {t("vas.validDurationDays", {
                            num: Math.ceil(pack.time / 86400),
                        })}
                    </Typography>
                </div>
            </ButtonBase>
        );
    }
}

export default withStyles(styles)(withTranslation()(PackSelect));
