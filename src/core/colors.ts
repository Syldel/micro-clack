export const colors = {
  // Raw ANSI codes
  code: {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
  },

  /**
   * Wrap text in a given ANSI code.
   */
  color: (text: string, code: string) => `${code}${text}${colors.code.reset}`,

  // Convenience helpers using code
  redText: (text: string) => `${colors.code.red}${text}${colors.code.reset}`,
  greenText: (text: string) => `${colors.code.green}${text}${colors.code.reset}`,
  yellowText: (text: string) => `${colors.code.yellow}${text}${colors.code.reset}`,
  blueText: (text: string) => `${colors.code.blue}${text}${colors.code.reset}`,
  magentaText: (text: string) => `${colors.code.magenta}${text}${colors.code.reset}`,
  cyanText: (text: string) => `${colors.code.cyan}${text}${colors.code.reset}`,

  brightText: (text: string) => `${colors.code.bright}${text}${colors.code.reset}`,
  dimText: (text: string) => `${colors.code.dim}${text}${colors.code.reset}`,
};
