#!/usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';
import chalk from 'chalk';
import { Listr } from 'listr2';
import { runIngest } from './pipeline/stages/ingest.js';
import { runCopy } from './pipeline/stages/copy.js';
import { runLocalize } from './pipeline/stages/localize.js';
import { runPlan } from './pipeline/stages/plan.js';
import { runGenerate } from './pipeline/stages/generate.js';
import { runComposite } from './pipeline/stages/composite.js';
import { runVerify } from './pipeline/stages/verify.js';
import { runReport } from './pipeline/stages/report.js';

const program = new Command();

program
  .name('harvest-lane')
  .description('Harvest Lane creative automation pipeline')
  .version('1.0.0');

program
  .command('ingest')
  .description('Validate campaign brief and assets')
  .requiredOption('-b, --brief <path>', 'Path to campaign JSON', 'inputs/briefs/campaign.json')
  .action(async (opts: { brief: string }) => {
    console.log(chalk.bold.green('\n▸ Ingest'));
    await runIngest(opts.brief);
    console.log(chalk.green('✓ Brief validated and state initialized\n'));
  });

program
  .command('copy')
  .option('--auto', 'Skip approval gate', false)
  .action(async (opts: { auto?: boolean }) => {
    console.log(chalk.bold.green('\n▸ Copy'));
    await runCopy(Boolean(opts.auto));
    console.log(chalk.green('✓ English copy saved\n'));
  });

program
  .command('localize')
  .option('--auto', 'Skip approval gate', false)
  .action(async (opts: { auto?: boolean }) => {
    console.log(chalk.bold.green('\n▸ Localize'));
    await runLocalize(Boolean(opts.auto));
    console.log(chalk.green('✓ Localized copy saved\n'));
  });

program
  .command('plan')
  .option('--auto', 'Skip approval gate', false)
  .action(async (opts: { auto?: boolean }) => {
    console.log(chalk.bold.green('\n▸ Plan'));
    await runPlan(Boolean(opts.auto));
    console.log(chalk.green('✓ Background plans saved\n'));
  });

program
  .command('generate')
  .option('--dry-run', 'Use placeholder backgrounds (no API spend)', false)
  .action(async (opts: { dryRun?: boolean }) => {
    console.log(chalk.bold.green('\n▸ Generate'));
    await runGenerate(Boolean(opts.dryRun));
    console.log(chalk.green('✓ Backgrounds generated\n'));
  });

program
  .command('composite')
  .action(async () => {
    console.log(chalk.bold.green('\n▸ Composite'));
    await runComposite();
    console.log(chalk.green('✓ Final ads composited\n'));
  });

program
  .command('verify')
  .action(async () => {
    console.log(chalk.bold.green('\n▸ Verify'));
    await runVerify();
    console.log(chalk.green('✓ Compliance checks passed\n'));
  });

program
  .command('report')
  .action(async () => {
    console.log(chalk.bold.green('\n▸ Report'));
    await runReport();
    console.log(chalk.green('✓ Manifest and HTML report written\n'));
  });

program
  .command('pipeline')
  .option('--auto', 'Skip human-in-the-loop gates', false)
  .option('--dry-run', 'Placeholder backgrounds only', false)
  .option('--fixture', 'Use offline demo copy/plans (no OpenRouter calls)', false)
  .option('-b, --brief <path>', 'Campaign brief path', 'inputs/briefs/campaign.json')
  .action(async (opts: { auto?: boolean; dryRun?: boolean; fixture?: boolean; brief: string }) => {
    const auto = Boolean(opts.auto);
    const dryRun = Boolean(opts.dryRun);
    const fixture = Boolean(opts.fixture);
    if (fixture) {
      process.env.PIPELINE_FIXTURE = '1';
    }

    console.log(chalk.bold.cyan('\nHarvest Lane Creative Pipeline\n'));

    const stages = [
      {
        title: 'Validating campaign brief & resolving assets',
        run: () => runIngest(opts.brief),
      },
      {
        title: fixture ? 'Loading fixture English copy' : 'Writing English ad copy (OpenRouter)',
        run: () => runCopy(auto, fixture),
      },
      {
        title: fixture ? 'Loading fixture localized copy' : 'Localizing copy (OpenRouter)',
        run: () => runLocalize(auto, fixture),
      },
      {
        title: fixture ? 'Loading fixture background plans' : 'Art-directing background scenes (OpenRouter)',
        run: () => runPlan(auto, fixture),
      },
      {
        title: dryRun
          ? 'Generating placeholder backgrounds (dry-run)'
          : 'Generating backgrounds (OpenRouter Gemini)',
        run: () => runGenerate(dryRun),
      },
      {
        title: 'Compositing final ads (background + product + text + logo)',
        run: () => runComposite(),
      },
      {
        title: 'Running brand & legal compliance checks',
        run: () => runVerify(),
      },
      {
        title: 'Building campaign manifest & HTML report',
        run: () => runReport(),
      },
    ];

    if (auto) {
      const tasks = new Listr(
        stages.map((stage) => ({ title: stage.title, task: stage.run })),
        { concurrent: false },
      );
      await tasks.run();
    } else {
      for (const stage of stages) {
        console.log(chalk.bold.green(`\n▸ ${stage.title}`));
        await stage.run();
        console.log(chalk.green('✓ Done'));
      }
    }

    console.log(chalk.bold.green('\n✓ Pipeline complete — see outputs/\n'));
  });

program.parseAsync(process.argv);
