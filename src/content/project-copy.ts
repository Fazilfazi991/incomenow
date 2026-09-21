const stageCopy: Record<string, { title: string; summary?: string }> = {
  "crm-validate": { title: "Check the customer problem" },
  "crm-adapt": { title: "Explore and tailor the example" },
  "crm-offer": { title: "Decide what you will sell", summary: "Define the setup, training, handover, and support you will include." },
  "crm-research": { title: "Find suitable potential customers" },
  "crm-pilot": { title: "Show the example and agree a first project" },
  "crm-launch": { title: "Test, hand over, and support" },
};

const taskCopy: Record<string, { title: string; description?: string }> = {
  "scope-sheet": {
    title: "List what your customer will receive",
    description: "Your package might include branding changes, agreed configuration, and a handover session. Confirm the actual work before quoting.",
  },
  "ownership-support": { title: "Agree ownership and support limits" },
  "field-inventory": { title: "List the information the customer needs" },
  "scope-trim": { title: "Remove what the customer does not need" },
  "permission-tests": { title: "Check who can see and change information" },
  "recovery-ownership": { title: "Agree backup, recovery, and ownership" },
};

export function projectStageCopy<T extends { id: string; title: string; summary: string }>(stage: T) {
  return { ...stage, title: stageCopy[stage.id]?.title ?? stage.title, summary: stageCopy[stage.id]?.summary ?? stage.summary };
}

export function projectTaskCopy<T extends { id: string; title: string; description: string }>(task: T) {
  return { ...task, title: taskCopy[task.id]?.title ?? task.title, description: taskCopy[task.id]?.description ?? task.description };
}
