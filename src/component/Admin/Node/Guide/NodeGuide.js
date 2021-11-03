import React, { useCallback, useMemo, useState } from "react";
import Stepper from "@material-ui/core/Stepper";
import StepLabel from "@material-ui/core/StepLabel";
import Step from "@material-ui/core/Step";
import Typography from "@material-ui/core/Typography";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../../../actions";
import { randomStr } from "../../../../utils";
import Communication from "./Communication";
import Aria2RPC from "./Aria2RPC";
import API from "../../../../middleware/Api";
import Metainfo from "./Metainfo";
import Completed from "./Completed";

const steps = [
    {
        slaveOnly: true,
        title: "通信配置",
        optional: false,
        component: function show(p) {
            return <Communication {...p} />;
        },
    },
    {
        slaveOnly: false,
        title: "离线下载",
        optional: false,
        component: function show(p) {
            return <Aria2RPC {...p} />;
        },
    },
    {
        slaveOnly: false,
        title: "杂项信息",
        optional: false,
        component: function show(p) {
            return <Metainfo {...p} />;
        },
    },
    {
        slaveOnly: false,
        title: "完成",
        optional: false,
        component: function show(p) {
            return <Completed {...p} />;
        },
    },
];

export default function NodeGuide(props) {
    const [activeStep, setActiveStep] = useState(0);
    const [skipped, setSkipped] = React.useState(new Set());
    const [loading, setLoading] = useState(false);
    const [node, setNode] = useState(
        props.node
            ? props.node
            : {
                  Status: 1,
                  Type: 0,
                  Aria2Enabled: "false",
                  Server: "https://example.com:5212",
                  SlaveKey: randomStr(64),
                  MasterKey: randomStr(64),
                  Rank: "0",
                  Aria2OptionsSerialized: {
                      token: randomStr(32),
                      options: "{}",
                      interval: "10",
                      timeout: "10",
                  },
              }
    );

    const usedSteps = useMemo(() => {
        return steps.filter((step) => !(step.slaveOnly && node.Type === 1));
    }, [node.Type]);

    const isStepSkipped = (step) => {
        return skipped.has(step);
    };

    const handleTextChange = (name) => (event) => {
        setNode({
            ...node,
            [name]: event.target.value,
        });
    };

    const handleOptionChange = (name) => (event) => {
        setNode({
            ...node,
            Aria2OptionsSerialized: {
                ...node.Aria2OptionsSerialized,
                [name]: event.target.value,
            },
        });
    };

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const nextStep = () => {
        if (props.node || activeStep + 1 === steps.length - 1) {
            setLoading(true);

            const nodeCopy = { ...node };
            nodeCopy.Aria2OptionsSerialized = {
                ...node.Aria2OptionsSerialized,
            };
            nodeCopy.Rank = parseInt(nodeCopy.Rank);
            nodeCopy.Aria2OptionsSerialized.interval = parseInt(
                nodeCopy.Aria2OptionsSerialized.interval
            );
            nodeCopy.Aria2OptionsSerialized.timeout = parseInt(
                nodeCopy.Aria2OptionsSerialized.timeout
            );
            nodeCopy.Aria2Enabled = nodeCopy.Aria2Enabled === "true";
            API.post("/admin/node", {
                node: nodeCopy,
            })
                .then(() => {
                    ToggleSnackbar(
                        "top",
                        "right",
                        "节点已" + (props.node ? "保存" : "添加"),
                        "success"
                    );
                    setActiveStep(activeStep + 1);
                    setLoading(false);
                })
                .catch((error) => {
                    ToggleSnackbar("top", "right", error.message, "error");
                })
                .then(() => {
                    setLoading(false);
                });
        } else {
            setActiveStep(activeStep + 1);
        }
    };

    return (
        <div>
            <Typography variant={"h6"}>
                {props.node ? "修改" : "添加"} 节点
            </Typography>
            <Stepper activeStep={activeStep}>
                {usedSteps.map((label, index) => {
                    const stepProps = {};
                    const labelProps = {};
                    if (label.optional) {
                        labelProps.optional = (
                            <Typography variant="caption">可选</Typography>
                        );
                    }
                    if (isStepSkipped(index)) {
                        stepProps.completed = false;
                    }
                    if (!(label.slaveOnly && node.Type === 1)) {
                        return (
                            <Step key={label.title} {...stepProps}>
                                <StepLabel {...labelProps}>
                                    {label.title}
                                </StepLabel>
                            </Step>
                        );
                    }
                })}
            </Stepper>

            {usedSteps[activeStep].component({
                onSubmit: (e) => nextStep(),
                node: node,
                loading: loading,
                onBack: (e) => setActiveStep(activeStep - 1),
                handleTextChange: handleTextChange,
                activeStep: activeStep,
                handleOptionChange: handleOptionChange,
            })}
        </div>
    );
}
