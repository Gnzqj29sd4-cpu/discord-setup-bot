'use strict';

// Détection de langue sans dépendance : arabe par l'alphabet, puis français ou
// anglais par les mots courants. Un message trop court est ignoré.

const ARABIC = /[\u0600-\u06FF]/u;
const ACCENTS = /[àâäçéèêëîïôöùûüÿœæ]/iu;

const FRENCH = new Set(
  `le la les de des du un une et est je tu il elle nous vous ils elles pas que qui
   dans pour avec sur mais ou où ce cette ces mon ma mes ton ta tes son sa ses
   au aux en ne plus très bien merci salut bonjour coucou ça ca comment pourquoi
   quand faire suis es sommes être avoir ai as a avons avez ont aussi tout tous
   rien oui non d accord ok moi toi lui leur leurs je suis c est j ai`
    .split(/\s+/)
    .filter(Boolean),
);

const ENGLISH = new Set(
  `the a an and or but is are was were be been i you he she it we they my your his
   her its our their this that these those not no yes do does did have has had
   with for from about into over under what why when how thanks thank hello hi
   hey good great nice okay ok to of in on at as if so just very much more can
   will would should all any some there here im ive dont cant`
    .split(/\s+/)
    .filter(Boolean),
);

function normalize(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLowerCase();
}

/**
 * Renvoie 'ara', 'fra', 'eng' ou null si la langue n'est pas identifiable.
 */
function detectLanguage(content) {
  if (!content) return null;
  if (ARABIC.test(content)) return 'ara';

  const clean = content
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^\p{L}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (clean.length < 25 || clean.split(' ').length < 4) return null;

  const words = normalize(clean).split(' ');
  let french = 0;
  let english = 0;

  for (const word of words) {
    if (FRENCH.has(word)) french += 1;
    if (ENGLISH.has(word)) english += 1;
  }

  if (ACCENTS.test(clean)) french += 2;

  if (french === english) return null;
  return french > english ? 'fra' : 'eng';
}

module.exports = { detectLanguage };
