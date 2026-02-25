import { colors } from '../src';

(async () => {
  console.log(colors.redText('Error!'));
  console.log(colors.greenText('Success!'));
  console.log(colors.yellowText('Warning!'));
  console.log(colors.blueText('Info'));
  console.log(colors.magentaText('Note'));
  console.log(colors.cyanText('Selection'));
  console.log(colors.brightText('Bold text'));
  console.log(colors.dimText('Dim text'));
})();
