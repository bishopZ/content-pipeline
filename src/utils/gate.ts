import readline from 'readline';

export const promptContinue = async (message: string, auto: boolean) => {
  if (auto) {
    console.log(`  ${message} (auto — continuing)`);
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise<string>((resolve) => {
    rl.question(`\n${message} [Y/n] `, resolve);
  });
  rl.close();

  if (answer.trim().toLowerCase() === 'n') {
    throw new Error('Stopped by user at approval gate.');
  }
};
