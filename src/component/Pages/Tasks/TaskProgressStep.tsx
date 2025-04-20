import { TaskResponse, TaskStatus } from "../../../api/workflow.ts";
import {
  Step,
  StepIcon,
  StepIconProps,
  StepLabel,
  Typography,
} from "@mui/material";
import { StepProps } from "@mui/material/Step/Step";
import { useTranslation } from "react-i18next";
import FacebookCircularProgress from "../../Common/CircularProgress.tsx";
import DismissCircleFilled from "../../Icons/DismissCircleFilled.tsx";
import { useMemo } from "react";
import CheckCircleFilled from "../../Icons/CheckCircleFilled.tsx";
import { usePopupState } from "material-ui-popup-state/hooks";
import { bindHover, bindPopover } from "material-ui-popup-state";
import StepProgressPopover from "./StepProgressPopover.tsx";

interface ProgressStepIconProps extends StepIconProps {}

const ProgressStepIcon =
  (task: TaskResponse) => (props: ProgressStepIconProps) => {
    const { active, completed, icon, ...rest } = props;

    let newIcon = icon;
    if (active) {
      newIcon = <FacebookCircularProgress sx={{ pt: "5px" }} size={24} />;
      if (task.status == TaskStatus.error) {
        newIcon = (
          <DismissCircleFilled
            sx={{ fontSize: 28.5, color: (theme) => theme.palette.error.main }}
          />
        );
      }
    } else if (completed) {
      newIcon = (
        <CheckCircleFilled
          sx={{ fontSize: 28.5, color: (theme) => theme.palette.primary.main }}
        />
      );
    }

    if (active && task.status == TaskStatus.error) {
      newIcon = (
        <DismissCircleFilled
          sx={{ fontSize: 28.5, color: (theme) => theme.palette.error.main }}
        />
      );
    }

    if (active && task.status == TaskStatus.canceled) {
      newIcon = (
        <DismissCircleFilled
          sx={{
            fontSize: 28.5,
            color: (theme) => theme.palette.action.active,
          }}
        />
      );
    }

    return (
      <StepIcon
        icon={newIcon}
        active={active}
        completed={completed}
        {...rest}
      />
    );
  };

export interface TaskProgressStepProps extends StepProps {
  task: TaskResponse;
  title: string;
  description?: string;
  showProgress?: boolean;
  progressing?: boolean;
}

const TaskProgressStep = ({
  task,
  title,
  description,
  showProgress,
  progressing,
  ...rest
}: TaskProgressStepProps) => {
  const popupState = usePopupState({
    variant: "popover",
    popupId: `progress_${task.id}_${title}`,
  });
  const { open, ...restPopup } = bindPopover(popupState);

  const StepIconComponent = useMemo(() => {
    return ProgressStepIcon(task);
  }, [task.status]);
  const { t } = useTranslation();
  return (
    <>
      <Step
        {...rest}
        {...(showProgress && progressing ? bindHover(popupState) : [])}
      >
        <StepLabel
          optional={
            description ? (
              <Typography variant={"caption"}>{t(description)}</Typography>
            ) : undefined
          }
          slots={{
            stepIcon: StepIconComponent
          }}
        >
          {t(title)}
        </StepLabel>
      </Step>
      {showProgress && progressing && (
        <StepProgressPopover task={task} open={open} {...restPopup} />
      )}
    </>
  );
};

export default TaskProgressStep;
