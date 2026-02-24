import { colors } from './colors';

export class Spinner {
  private frames = ['-', '\\', '|', '/'];
  private i = 0;
  private interval?: ReturnType<typeof setInterval>;

  /** Démarre le spinner avec un message initial */
  start(msg: string) {
    process.stdout.write(colors.bright + msg + colors.reset + ' ');

    this.interval = setInterval(() => {
      process.stdout.write('\b' + this.frames[this.i]);
      this.i = (this.i + 1) % this.frames.length;
    }, 100);
  }

  /** Arrête le spinner et affiche un message final facultatif */
  stop(finalMsg?: string) {
    if (this.interval) clearInterval(this.interval);
    process.stdout.write('\b'); // supprime le dernier caractère du spinner
    if (finalMsg) process.stdout.write(finalMsg + '\n');
  }
}
