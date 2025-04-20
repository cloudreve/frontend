import { Link, Typography } from "@mui/material";
import { memo, useCallback, useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Task } from "../../../api/dashboard";
import { TaskSummary, TaskType } from "../../../api/workflow";
import CrUri, { Filesystem } from "../../../util/uri";
import TaskSummaryTitle from "../../Pages/Tasks/TaskSummaryTitle";

const userTaskTypes: string[] = [
  TaskType.relocate,
  TaskType.create_archive,
  TaskType.extract_archive,
  TaskType.remote_download,
];

export interface TaskContentProps {
  task: Task;
  openEntity?: (entityID: number) => void;
}

const processUrl = (url: string, userHashId: string) => {
  const crUrl = new CrUri(url);
  if (crUrl.fs() == Filesystem.my && !crUrl.id()) {
    crUrl.setUsername(userHashId);
  }
  return crUrl.toString();
};

export const processTaskContent = (summary: TaskSummary, userHashId: string): TaskSummary => {
  if (summary.props?.src) {
    summary.props.src = processUrl(summary.props.src, userHashId);
  }
  if (summary.props?.dst) {
    summary.props.dst = processUrl(summary.props.dst, userHashId);
  }
  if (summary.props?.src_multiple) {
    summary.props.src_multiple = summary.props.src_multiple.map((url) => processUrl(url, userHashId));
  }

  return summary;
};

export const TaskContent = memo(({ task, openEntity }: TaskContentProps) => {
  const { t } = useTranslation("dashboard");

  if (userTaskTypes.includes(task.type ?? "")) {
    const processedSummary = processTaskContent({ ...task.summary } as TaskSummary, task?.user_hash_id ?? "");
    return (
      <Typography variant="body2">
        <TaskSummaryTitle type={task.type?.toString() ?? ""} summary={processedSummary} isInDashboard />
      </Typography>
    );
  }

  const entityLinkClick = useCallback(
    (entityID: number) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (openEntity) {
        openEntity(entityID);
      }
    },
    [openEntity],
  );

  const content = useMemo(() => {
    var privateState: any = {};
    try {
      privateState = JSON.parse(task.private_state ?? "{}");
    } catch (error) {
      console.error(error);
    }
    switch (task.type) {
      case TaskType.upload_sentinel_check:
        return t("task.uploadSentinelCheck", { uploadSessionID: privateState?.session?.Props?.UploadSessionID });
      case TaskType.media_metadata:
        return (
          <Trans
            ns="dashboard"
            values={{ entityID: privateState?.entity_id ?? 0 }}
            i18nKey="task.mediaMetadata"
            components={[<Link key={0} href={"#/"} onClick={entityLinkClick(privateState?.entity_id ?? 0)} />]}
          />
        );
      case TaskType.entity_recycle_routine:
        return t("task.entityRecycleRoutine");
      case TaskType.explicit_entity_recycle:
        return t("task.explicitEntityRecycle", {
          blobs: privateState?.entity_ids?.map((id: number) => `#${id}`).join(", "),
        });
      default:
        return "";
    }
  }, [task, t]);

  return <Typography variant="body2">{content}</Typography>;
});
