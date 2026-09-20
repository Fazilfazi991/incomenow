export type ProgressInput = { required: boolean; completed_at: string | null };

export type StageProgressInput = { tasks: ProgressInput[] };

export type ProjectProgress = {
  completed: number;
  total: number;
  percent: number;
  isComplete: boolean;
};

export function deriveProgress(tasks: ProgressInput[]): ProjectProgress {
  const required = tasks.filter((task) => task.required);
  const completed = required.filter((task) => Boolean(task.completed_at)).length;
  const total = required.length;
  return {
    completed,
    total,
    percent: total ? Math.round((completed / total) * 100) : 0,
    isComplete: total > 0 && completed === total,
  };
}

export function deriveStageProgress(stages: StageProgressInput[]): ProjectProgress {
  const requiredStages = stages.filter((stage) => stage.tasks.some((task) => task.required));
  const completed = requiredStages.filter((stage) => {
    const requiredTasks = stage.tasks.filter((task) => task.required);
    return requiredTasks.every((task) => Boolean(task.completed_at));
  }).length;
  const total = requiredStages.length;
  return {
    completed,
    total,
    percent: total ? Math.round((completed / total) * 100) : 0,
    isComplete: total > 0 && completed === total,
  };
}
