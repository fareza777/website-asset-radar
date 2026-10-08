import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

export function runCommand(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8", shell: false });
  if (result.error || result.status !== 0)
    throw new Error(
      `${path.basename(command)} ${args[0] ?? ""} failed: ${result.error?.message ?? result.stderr?.trim() ?? `exit ${result.status}`}`,
    );
  return result.stdout?.trim() ?? "";
}

export function runNpm(args) {
  if (process.platform !== "win32") return runCommand("npm", args);
  // Windows .cmd wrappers cannot be executed by spawnSync with shell:false.
  const candidates = [
    process.env.npm_execpath,
    path.join(
      path.dirname(process.execPath),
      "node_modules/npm/bin/npm-cli.js",
    ),
    ...runCommand("where.exe", ["npm"])
      .split(/\r?\n/)
      .map((file) =>
        path.join(path.dirname(file), "node_modules/npm/bin/npm-cli.js"),
      ),
  ];
  const cli = candidates.find(
    (file) => file?.endsWith("npm-cli.js") && existsSync(file),
  );
  if (!cli)
    throw new Error(
      "Cannot locate npm's JavaScript CLI; install Node.js with npm",
    );
  return runCommand(process.execPath, [cli, ...args]);
}
