import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, symlinkSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installSkill } from './install-alpha.mjs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('native launch preserves paths, TOML quotes and Crumb prompt through an npm entry', () => {
  const folder = mkdtempSync(join(tmpdir(), 'crumb launcher with spaces '));
  const entry = join(folder, 'node_modules/@openai/codex/bin/codex.js');
  mkdirSync(join(folder, 'node_modules/@openai/codex/bin'), { recursive: true });
  const capture = join(folder, 'argv.json');
  writeFileSync(entry, "require('node:fs').writeFileSync(process.env.CRUMB_ARGV_CAPTURE, JSON.stringify(process.argv.slice(2)));\n");
  const workspace = join(folder, "test.workspace with spaces and 'apostrophe");
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('./launch-alpha.mjs', import.meta.url))], {
    env: { ...process.env, CRUMB_CODEX: join(folder, 'codex.ps1'), CRUMB_ALPHA_WORKSPACE: workspace, CRUMB_ARGV_CAPTURE: capture },
    encoding: 'utf8', windowsHide: true,
  });
  assert.equal(result.status, 0, result.stderr);
  const args = JSON.parse(readFileSync(capture));
  assert.equal(args[1], workspace);
  assert.equal(args[3], `projects={${JSON.stringify(workspace)}={trust_level="trusted"}}`);
  assert.ok(args[4].startsWith('$crumb '));
});

test('fresh and repeat installation preserves config and other skills, locates runtime', () => {
  const home = mkdtempSync(join(tmpdir(), 'crumb alpha '));
  mkdirSync(join(home, '.codex'), { recursive: true });
  mkdirSync(join(home, '.agents/skills/another'), { recursive: true });
  const config = '# user config\nmodel = "existing"\n[mcp_servers.existing]\ncommand = "existing"\n';
  writeFileSync(join(home, '.codex/config.toml'), config);
  writeFileSync(join(home, '.agents/skills/another/SKILL.md'), 'keep');
  const skill = installSkill({ home });
  const before = readFileSync(skill, 'utf8');
  assert.equal(installSkill({ home }), skill);
  assert.equal(readFileSync(skill, 'utf8'), before);
  assert.equal(readFileSync(join(home, '.codex/config.toml'), 'utf8'), config);
  assert.equal(readFileSync(join(home, '.agents/skills/another/SKILL.md'), 'utf8'), 'keep');
  const runtime = JSON.parse(readFileSync(join(home, '.agents/skills/crumb/runtime.json')));
  assert.equal(runtime.node, process.execPath);
  assert.ok(runtime.cli.endsWith('main.js'));
  unlinkSync(join(home, '.agents/skills/crumb/runtime.json'));
  installSkill({ home });
  assert.equal(JSON.parse(readFileSync(join(home, '.agents/skills/crumb/runtime.json'))).cli, runtime.cli);
  writeFileSync(skill, 'user edit');
  assert.throws(() => installSkill({ home }), /Modified skill file preserved/);
  assert.equal(readFileSync(skill, 'utf8'), 'user edit');
});

test('unowned Crumb skill and linked directories are preserved', () => {
  const home = mkdtempSync(join(tmpdir(), 'crumb collision '));
  mkdirSync(join(home, '.agents/skills/crumb'), { recursive: true });
  writeFileSync(join(home, '.agents/skills/crumb/SKILL.md'), 'existing');
  assert.throws(() => installSkill({ home }), /not owned/);
  const linked = mkdtempSync(join(tmpdir(), 'crumb linked '));
  symlinkSync(join(home, '.agents'), join(linked, '.agents'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => installSkill({ home: linked }), /Linked installation path/);
});
