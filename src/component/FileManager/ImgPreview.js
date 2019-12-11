import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { baseURL } from "../../middleware/Api";
import { showImgPreivew } from "../../actions/index";
import { imgPreviewSuffix } from "../../config";
import { withStyles } from "@material-ui/core";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";

const styles = theme => ({});

const mapStateToProps = state => {
    return {
        first: state.explorer.imgPreview.first,
        other: state.explorer.imgPreview.other
    };
};

const mapDispatchToProps = dispatch => {
    return {
        showImgPreivew: first => {
            dispatch(showImgPreivew(first));
        }
    };
};

class ImgPreviewCompoment extends Component {
    state = {
        items: [],
        photoIndex: 0,
        isOpen: false
    };

    componentWillReceiveProps = nextProps => {
        let items = [];
        let firstOne = 0;
        if (nextProps.first !== null) {
            // eslint-disable-next-line
            nextProps.other.map(value => {
                let fileType = value.name
                    .split(".")
                    .pop()
                    .toLowerCase();
                if (imgPreviewSuffix.indexOf(fileType) !== -1) {
                    let newImg = {
                        title: value.name,
                        src:
                            baseURL +
                            "/file/download" +
                            (value.path === "/"
                                ? value.path + value.name
                                : value.path + "/" + value.name)
                    };
                    if (
                        value.path === nextProps.first.path &&
                        value.name === nextProps.first.name
                    ) {
                        firstOne = items.length;
                    }
                    items.push(newImg);
                }
            });
            this.setState({
                photoIndex:firstOne,
                items: items,
                isOpen: true
            });
        }
    };

    handleClose = () => {
        this.props.showImgPreivew(null);
        this.setState({
            isOpen: false
        });
    };

    render() {
        const { photoIndex, isOpen,items } = this.state;

        return (
            <div>
                 {isOpen && (<Lightbox
                    mainSrc={items[photoIndex].src}
                    nextSrc={items[(photoIndex + 1) % items.length].src}
                    prevSrc={items[(photoIndex + items.length - 1) % items.length].src}
                    onCloseRequest={() => this.handleClose()}
                    imageLoadErrorMessage = "无法加载此图像"
                    imageCrossOrigin = "use-credentials"
                    imageTitle = {items[photoIndex].title}
                    onMovePrevRequest={() =>
                      this.setState({
                        photoIndex: (photoIndex + items.length - 1) % items.length,
                      })
                    }
                    reactModalStyle={{
                        overlay:{
                            zIndex:10000
                        },
                    }}
                    onMoveNextRequest={() =>
                      this.setState({
                        photoIndex: (photoIndex + 1) % items.length,
                      })
                    }
                />)}
            </div>
        );
    }
}

ImgPreviewCompoment.propTypes = {
    classes: PropTypes.object.isRequired
};

const ImgPreivew = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(ImgPreviewCompoment));

export default ImgPreivew;
