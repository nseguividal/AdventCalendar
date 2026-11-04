import type { ChallengeDefinition, ChallengeType } from './types'
import type { RiddleConfig } from './riddle/types'
import type { WordSearchConfig } from './wordsearch/types'
import type { QuizConfig } from './quiz/types'
import type { PhotoVotingConfig } from './photo_voting/types'
import type { MemoryConfig } from './memory/types'
import type { WordleConfig } from './wordle/types'
import type { SnowmanConfig } from './snowman/types'
import type { ScrambleConfig } from './scramble/types'
import type { EquationConfig } from './equation/types'
import type { SnowglobesConfig } from './snowglobes/types'
import type { CatchGiftsConfig } from './catch_gifts/types'
import type { FindCaganerConfig } from './find_caganer/types'
import type { BellsMemoryConfig } from './bells_memory/types'
import type { PicaTioConfig } from './pica_tio/types'
import type { SudokuConfig } from './sudoku/types'

export const CHALLENGE_REGISTRY: Record<ChallengeType, ChallengeDefinition> = {
  riddle: {
    type: 'riddle',
    name: 'Endevinalla',
    description: 'Pregunta de text amb pista opcional per encertar la paraula.',
    icon: '📜',
    badgeLabel: 'Endevinalla de Nadal',
    defaultConfig: {
      question: '',
      solution: '',
      hint: '',
    } as RiddleConfig,
  },
  wordsearch: {
    type: 'wordsearch',
    name: 'Sopa de lletres',
    description: 'Troba paraules nadalenques amagades a la graella interactiva.',
    icon: '🔍',
    badgeLabel: 'Sopa de lletres',
    defaultConfig: {
      title: 'Troba les paraules nadalenques:',
      words: ['NADAL', 'TIO', 'NEU'],
      gridSize: 8,
    } as WordSearchConfig,
  },
  quiz: {
    type: 'quiz',
    name: 'Pregunta familiar (Quiz)',
    description: 'Pregunta tipus test amb opcions múltiples sobre la família.',
    icon: '❓',
    badgeLabel: 'Trivia familiar',
    defaultConfig: {
      questions: [
        {
          question: '',
          options: ['Opció 1', 'Opció 2', 'Opció 3', 'Opció 4'],
          correctIndex: 0,
          explanation: '',
        },
      ],
      question: '',
      options: ['Opció 1', 'Opció 2', 'Opció 3', 'Opció 4'],
      correctIndex: 0,
      explanation: '',
    } as QuizConfig,
  },
  photo_voting: {
    type: 'photo_voting',
    name: 'Endevina el nadó',
    description: 'Fotografia d\'un familiar de petit per endevinar qui és.',
    icon: '👶',
    badgeLabel: 'Foto misteriosa',
    defaultConfig: {
      photos: [
        {
          title: 'Qui és aquest nadó de la família?',
          imageUrl: '',
          options: ['La mare', 'El pare', "L'oncle Jordi", 'La tieta Marta'],
          correctPerson: 'La mare',
          hint: '',
        },
      ],
      title: 'Qui és aquest nadó de la família?',
      imageUrl: '',
      options: ['La mare', 'El pare', "L'oncle Jordi", 'La tieta Marta'],
      correctPerson: 'La mare',
      hint: '',
    } as PhotoVotingConfig,
  },
  memory: {
    type: 'memory',
    name: 'Joc de memòria',
    description: 'Troba les parelles de símbols nadalencs girant cartes.',
    icon: '🃏',
    badgeLabel: 'Parelles de memòria',
    defaultConfig: {
      title: 'Troba les parelles nadalenques:',
      totalCards: 12,
      pairCount: 6,
    } as MemoryConfig,
  },
  wordle: {
    type: 'wordle',
    name: 'Wordle de Nadal',
    description: 'Endevina la paraula secreta en 6 intents amb pistes de color.',
    icon: '🟩',
    badgeLabel: 'Wordle nadalenc',
    defaultConfig: {
      targetWord: 'NADAL',
      maxAttempts: 6,
      title: 'Endevina la paraula secreta',
      hint: '',
    } as WordleConfig,
  },
  snowman: {
    type: 'snowman',
    name: 'El ninot de neu',
    description: 'Clàssic penjat nadalenc: salva el ninot abans que es desfaci!',
    icon: '☃️',
    badgeLabel: 'Ninot de neu',
    defaultConfig: {
      word: 'TIÓ DE NADAL',
      words: [{ word: 'TIÓ DE NADAL', hint: '' }],
      maxErrors: 6,
      title: 'Salva el ninot de neu!',
      hint: '',
    } as SnowmanConfig,
  },
  scramble: {
    type: 'scramble',
    name: 'Lletres desordenades',
    description: 'Ordena les lletres barrejades per desxifrar una o més paraules.',
    icon: '🔤',
    badgeLabel: 'Lletres desordenades',
    defaultConfig: {
      title: 'Ordena les lletres per formar la paraula',
      words: [
        { word: 'NADAL', hint: "L'època més màgica de l'any" },
        { word: 'ESTEL', hint: 'Brilla al cel de la nit de Nadal' },
      ],
    } as ScrambleConfig,
  },
  equation: {
    type: 'equation',
    name: 'Equació nadalenca',
    description: 'Enigma matemàtic visual amb icones i emoticones de Nadal.',
    icon: '🔢',
    badgeLabel: 'Equació nadalenca',
    defaultConfig: {
      title: 'Enigma Matemàtic de Nadal',
      lines: [
        '🎄 + 🎄 = 10',
        '🎄 + 🎁 = 9',
        '🎁 + 🔔 = 7',
        '🎄 + 🎁 × 🔔 = ?',
      ],
      solution: 17,
      hint: 'Multiplicació abans de suma!',
    } as EquationConfig,
  },
  snowglobes: {
    type: 'snowglobes',
    name: 'Barreja de boles',
    description: 'Relaciona cada bola de vidre amb la seva ciutat corresponent.',
    icon: '🔮',
    badgeLabel: 'Barreja de boles',
    defaultConfig: {
      title: 'Barreja de boles de neu',
      items: [
        { id: 'atenes', cityName: 'Atenes', cityCode: 'ATH', imageUrl: '/snowglobes/atenes.png' },
        { id: 'barcelona', cityName: 'Barcelona', cityCode: 'BCN', imageUrl: '/snowglobes/barcelona.png' },
        { id: 'berlin', cityName: 'Berlín', cityCode: 'BER', imageUrl: '/snowglobes/berlin.png' },
        { id: 'budapest', cityName: 'Budapest', cityCode: 'BUD', imageUrl: '/snowglobes/budapest.png' },
        { id: 'elcaire', cityName: 'El Caire', cityCode: 'CAI', imageUrl: '/snowglobes/elcaire.png' },
        { id: 'londres', cityName: 'Londres', cityCode: 'LON', imageUrl: '/snowglobes/londres.png' },
        { id: 'mila', cityName: 'Milà', cityCode: 'MIL', imageUrl: '/snowglobes/mila.png' },
        { id: 'novayork', cityName: 'Nova York', cityCode: 'NYC', imageUrl: '/snowglobes/novayork.png' },
        { id: 'paris', cityName: 'París', cityCode: 'PAR', imageUrl: '/snowglobes/paris.png' },
        { id: 'pisa', cityName: 'Pisa', cityCode: 'PSA', imageUrl: '/snowglobes/pisa.png' },
        { id: 'rio', cityName: 'Rio de Janeiro', cityCode: 'RIO', imageUrl: '/snowglobes/rio.png' },
        { id: 'roma', cityName: 'Roma', cityCode: 'FCO', imageUrl: '/snowglobes/roma.png' },
        { id: 'sydney', cityName: 'Sydney', cityCode: 'SYD', imageUrl: '/snowglobes/sydney.png' },
        { id: 'venecia', cityName: 'Venècia', cityCode: 'VCE', imageUrl: '/snowglobes/venecia.png' },
      ],
    } as SnowglobesConfig,
  },
  catch_gifts: {
    type: 'catch_gifts',
    name: 'Atrapa els regals',
    description: 'Toca els regals que cauen del cel per recollir-los abans que s\'acabi el temps!',
    icon: '🎁',
    badgeLabel: 'Atrapa regals',
    defaultConfig: {
      title: 'Atrapa els regals de Nadal!',
      targetScore: 8,
      durationSeconds: 20,
      speed: 'normal',
    } as CatchGiftsConfig,
  },
  find_caganer: {
    type: 'find_caganer',
    name: 'On és el Caganer?',
    description: 'Troba la figureta del Caganer amagada a l\'escena nadalenca del pessebre.',
    icon: '💩',
    badgeLabel: 'On és el Caganer?',
    defaultConfig: {
      title: 'Troba el Caganer amagat al pessebre!',
      caganerX: 72,
      caganerY: 68,
      toleranceRadius: 8,
      hint: 'Busca darrere de l\'arbre a la dreta del riu...',
    } as FindCaganerConfig,
  },
  bells_memory: {
    type: 'bells_memory',
    name: 'Campanes de Nadal',
    description: 'Repeteix la melodia nadalenca tocant les campanes en el mateix ordre.',
    icon: '🔔',
    badgeLabel: 'Campanes de Nadal',
    defaultConfig: {
      title: 'Repeteix la melodia de les campanes',
      rounds: 4,
      hint: 'Escolta atentament i fixa\'t en els colors de cada campana!',
    } as BellsMemoryConfig,
  },
  pica_tio: {
    type: 'pica_tio',
    name: 'Pica el Tió',
    description: 'Pica fort el tronc del Tió de Nadal amb el bastó fins que cagui el regal!',
    icon: '🪵',
    badgeLabel: 'Caga Tió',
    defaultConfig: {
      title: 'Pica fort el Tió de Nadal!',
      hitsRequired: 20,
      prizeName: 'Torrons, neules i xocolata!',
      verse: 'Caga tió, tió de Nadal, no caguis arengades que són massa salades, caga torrons que són més bons!',
    } as PicaTioConfig,
  },
  sudoku: {
    type: 'sudoku',
    name: 'Mini Sudoku nadalenc',
    description: 'Completa la graella 4×4 amb 4 símbols nadalencs sense repetir-ne cap.',
    icon: '🧩',
    badgeLabel: 'Sudoku nadalenc',
    defaultConfig: {
      title: 'Mini Sudoku de Nadal',
      symbols: ['🎄', '⭐', '🎁', '🔔'],
      initialGrid: [
        [0, null, 2, null],
        [null, 3, null, 1],
        [1, null, 3, null],
        [null, 2, null, 0],
      ],
      solutionGrid: [
        [0, 1, 2, 3],
        [2, 3, 0, 1],
        [1, 0, 3, 2],
        [3, 2, 1, 0],
      ],
      hint: 'Cap símbol es pot repetir a la mateixa fila, columna ni bloc de 2x2!',
    } as SudokuConfig,
  },
}
