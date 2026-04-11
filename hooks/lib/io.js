export async function readJsonStdin() {
  const chunks = [];

  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
}

export function writeJsonStdout(payload) {
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
}

export function writeTextStdout(text) {
  if (!text) {
    return;
  }

  process.stdout.write(`${text}\n`);
}
