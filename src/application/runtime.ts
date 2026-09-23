export const TESTED_NODE = '24.19.0';

export function requireTestedRuntime(version = process.versions.node): void {
  if (version !== TESTED_NODE) {
    throw new Error(`CEC M0 requires tested Node ${TESTED_NODE}; found ${version}. Select the pinned runtime before continuing.`);
  }
}
