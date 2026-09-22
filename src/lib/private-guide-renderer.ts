type GuideStep = {
  label: string;
  title: string;
  status: string;
  body: string;
  commands?: string[];
};

export function renderPrivateSetupGuideMarkdown(options: {
  title: string;
  introduction: string;
  steps: GuideStep[];
  promptHeading: string;
  prompts: string[];
  warning: string;
}) {
  const sections = options.steps.map((section) => {
    const commands = section.commands?.length
      ? `\n\n\`\`\`text\n${section.commands.join("\n")}\n\`\`\``
      : "";
    return `## ${section.label}. ${section.title}\n\n**Status:** ${section.status}\n\n${section.body}${commands}`;
  }).join("\n\n");
  const prompts = options.prompts.map((prompt, index) => `${index + 1}. ${prompt}`).join("\n");
  return `# ${options.title}\n\n${options.introduction}\n\n${sections}\n\n## ${options.promptHeading}\n\n${prompts}\n\n${options.warning}\n`;
}
