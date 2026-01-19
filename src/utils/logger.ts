import chalk from 'chalk';

export const logger = {
  banner(text: string) {
    console.log(chalk.bold.blue(`\n${text}\n`));
  },

  info(text: string) {
    console.log(chalk.cyan(`→ ${text}`));
  },

  success(text: string) {
    console.log(chalk.green(`✓ ${text}`));
  },

  warning(text: string) {
    console.log(chalk.yellow(`⚠ ${text}`));
  },

  error(text: string) {
    console.log(chalk.red(`✗ ${text}`));
  },

  gray(text: string) {
    console.log(chalk.gray(`  ${text}`));
  },

  newline() {
    console.log();
  }
};
