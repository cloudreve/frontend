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
    },
    {
        slaveOnly: false,
        title: "完成",
        optional: false,
    },
];

export default function NodeGuide(props) {
    const [activeStep, setActiveStep] = useState(0);
    const [skipped, setSkipped] = React.useState(new Set());
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
                  Aria2Options: {
                      Token: randomStr(32),
                      Options: "{}",
                      Interval: 10,
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
            Aria2Options: {
                ...node.Aria2Options,
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
                onSubmit: (e) => setActiveStep(activeStep + 1),
                node: node,
                onBack: (e) => setActiveStep(activeStep - 1),
                handleTextChange: handleTextChange,
                activeStep: activeStep,
                handleOptionChange: handleOptionChange,
            })}
        </div>
    );
}
