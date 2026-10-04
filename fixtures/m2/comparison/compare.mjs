import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const parse = JSON.parse;
const dimensions = ['technical', 'sector', 'fundamental', 'catalyst'];
const text = value => typeof value === 'string' && value.trim().length > 0;

export function compare(input) {
  if (!input || !Array.isArray(input.candidates) || input.candidates.length < 2 || input.candidates.length > 6)
    throw new Error('Provide two to six candidates to compare.');
  if (!text(input.note)) throw new Error('Add your review note so the reasoning is retained.');
  const seen = new Set();
  const candidates = input.candidates.map(candidate => {
    if (!candidate || !text(candidate.symbol) || !text(candidate.asOf) || dimensions.some(key => !text(candidate[key])))
      throw new Error('Each candidate needs a symbol, asOf date and technical, sector, fundamental and catalyst notes. Use "Unknown" when a fact is unavailable.');
    const symbol = candidate.symbol.trim().toUpperCase();
    if (seen.has(symbol)) throw new Error('Use each candidate symbol once.');
    seen.add(symbol);
    return { symbol, asOf: candidate.asOf.trim(), ...Object.fromEntries(dimensions.map(key => [key, candidate[key].trim()])) };
  });
  return { candidates, note: input.note.trim(), limitation: 'Supplied observations only. Dates and facts are not independently verified; no ranking, forecast or investment recommendation.' };
}
export function run(inputPath, outputPath) {
  if (!inputPath || !outputPath) throw new Error('Usage: node compare.mjs shortlist.json review.json');
  const review = compare(parse(readFileSync(inputPath, 'utf8')));
  // Refuse to overwrite earlier notes or the input file.
  writeFileSync(outputPath, JSON.stringify(review, null, 2) + '\n', { flag: 'wx' });
  return review;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { const result = run(process.argv[2], process.argv[3]); console.log(JSON.stringify(result, null, 2)); }
  catch (error) { console.error(`Cannot save comparison: ${error.message}`); process.exitCode = 2; }
}
