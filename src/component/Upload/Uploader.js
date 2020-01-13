import React, { Component } from "react";
import uploaderLoader from "../../loader";
import { connect } from "react-redux";
import {refreshFileList, refreshStorage, toggleSnackbar} from "../../actions";
import FileList from "./FileList.js";
import Auth from "../../middleware/Auth"
import UploadButton from "../Dial/Create.js"

let loaded = false;

const mapStateToProps = state => {
    return {
        path: state.navigator.path
    };
};
 
const mapDispatchToProps = dispatch => {
    return {
        refreshFileList: () => {
            dispatch(refreshFileList());
        },
        refreshStorage: () => {
            dispatch(refreshStorage());
        },
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
        },
    };
};

class UploaderComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            queued: 0
        };
    }

    setRef(val) {
        this.fileList = val;
    }

    cancelUpload(file) {
        this.uploader.removeFile(file);
    }

    componentWillReceiveProps({ isScriptLoaded, isScriptLoadSucceed }) {
        if (isScriptLoaded && !this.props.isScriptLoaded) {
            // load finished
            if (isScriptLoadSucceed) {
                if (loaded) {
                    return;
                }
                loaded = true;
                var user = Auth.GetUser();
                this.uploader = window.Qiniu.uploader({
                    runtimes: "html5",
                    browse_button: "pickfiles",
                    container: "container",
                    drop_element: "container",
                    max_file_size: user.policy.maxSize,
                    dragdrop: true,
                    chunk_size: user.policy.saveType === "qiniu" ? 4*1024*1024 : 0,
                    filters: {
                        mime_types: user.policy.allowedType === null ? [] : user.policy.allowedType,
                    },
                    // iOS不能多选？
                    multi_selection: true,
                    uptoken_url: "/api/v3/file/upload/credential",
                    uptoken:user.policy.saveType === "local" ? "token" : null,
                    domain: "s",
                    max_retries:0,
                    get_new_uptoken: true,
                    auto_start: true,
                    log_level: 5,
                    init: {
                        FilesAdded: ( up, files ) => {
                            if(window.policyType !== user.policy.saveType){
                                up.stop();
                                this.props.toggleSnackbar(
                                    "top",
                                    "right",
                                    "存储策略已变更，请刷新页面",
                                    "warning"
                                )
                            }
                            this.fileList["openFileList"]();
                            window.plupload.each(files, files => {
                                window.pathCache[files.id] = this.props.path;
                                this.fileList["enQueue"](files);
                            });
                        },

                        BeforeUpload: function(up, file) {},
                        QueueChanged: up => {
                            this.setState({ queued: up.total.queued });
                        },
                        UploadProgress: (up, file) => {
                            console.log("UploadProgress",file);
                            this.fileList["updateStatus"](file);
                        },
                        UploadComplete: (up, file) => {
                            if (file.length === 0) {
                                return;
                            }
                            if (file[0].status === 5) {
                                this.fileList["setComplete"](file[0]);
                                this.props.refreshFileList();
                                this.props.refreshStorage();
                            }
                        },
                        FileUploaded: function(up, file, info) {},
                        Error: (up, err, errTip) => {
                            this.fileList["openFileList"]();
                            this.fileList["setError"](err.file, errTip);
                        },
                        FilesRemoved: (up, files) => {}
                    }
                });
                // this.fileList["openFileList"]();
            } else this.onError();
        }
    }

    onError() {}

    openFileList = () => {
        this.fileList["openFileList"]();
    };

    render() {
        return (
            <div>
                <FileList
                    inRef={this.setRef.bind(this)}
                    cancelUpload={this.cancelUpload.bind(this)}
                />
                <UploadButton Queued={this.state.queued} openFileList={this.openFileList} />
            </div>
        );
    }
}

const Uploader = connect(mapStateToProps, mapDispatchToProps, null, {
    forwardRef: true
})(
    uploaderLoader()(UploaderComponent)
);

export default Uploader;
