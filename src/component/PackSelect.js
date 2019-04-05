import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import ButtonBase from '@material-ui/core/ButtonBase';
import Typography from '@material-ui/core/Typography';
import classNames from 'classnames';
const styles = theme => ({
    container:{
        border:" 1px solid #e6e9eb",
        borderRadius: "4px",
        transition:"border .5s",
        width:"100%",
        display:"block",
    },
    active:{
        border:" 1px solid "+theme.palette.primary.main,
    },
    boxHead:{
        textAlign: "center",
        padding: "10px 10px 10px",
        borderBottom: "1px solid #e6e9eb",
        color: "#555",
        width:"100%",
    },
    price:{
        fontSize: "33px",
        fontWeight: "500",
        lineHeight: "40px",
        color:theme.palette.primary.main,
    },
    packName:{
        marginTop:"5px",
        marginBottom:"5px",
    },
    boxBottom:{
        color: "#555",
        textAlign: "center",
        padding: "5px",
    }
})

class PackSelect extends Component {

    render() {
        const { classes,pack } = this.props;
        return (
            <ButtonBase
                className={classNames(classes.container,
                        {[classes.active]:this.props.active}
                    )}
                onClick={this.props.onSelect}
            >
                <div className={classes.boxHead}>
                    <Typography variant="subtitle1" className={classes.packName}>{pack.name}</Typography>
                    <Typography className={classes.price}>￥{pack.price}</Typography>
                </div>
                <div className={classes.boxBottom}>
                    <Typography>有效期：{Math.ceil(pack.time / 86400)}天</Typography>
                </div>
            </ButtonBase>
        );
    }

}

export default withStyles(styles)(PackSelect)