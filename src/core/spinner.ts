import { colors } from './colors';

export class Spinner {
  private frames = ['-', '\\', '|', '/'];
  private i = 0;
  private interval?: ReturnType<typeof setInterval>;

  /**
   * Démarre le spinner avec un message initial. S'il tournait déjà, sa ligne
   * est close d'abord : écraser la référence laissait l'ancien intervalle
   * dessiner sans fin et garder le processus en vie.
   */
  start(msg: string) {
    if (this.interval) {
      this.stop();
      process.stdout.write('\n');
    }
    // Le premier symbole se dessine tout de suite, après l'espace : chaque tour
    // recule ensuite sur lui seul. Avant, le premier tour reculait sur l'espace
    // et le message final se collait au libellé (« ProcessingDone! »).
    process.stdout.write(colors.brightText(msg) + ' ' + this.frames[0]);
    this.i = 1;

    this.interval = setInterval(() => {
      process.stdout.write('\b' + this.frames[this.i]);
      this.i = (this.i + 1) % this.frames.length;
    }, 100);
  }

  /** Arrête le spinner et affiche un message final facultatif ; sans effet s'il ne tourne pas */
  stop(finalMsg?: string) {
    if (!this.interval) return;
    clearInterval(this.interval);
    this.interval = undefined;
    this.i = 0;
    process.stdout.write('\b \b'); // efface le symbole et laisse l'espace
    if (finalMsg) process.stdout.write(finalMsg + '\n');
  }
}
