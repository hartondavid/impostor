import type { Player, QuestionItem } from "./types"
import { VERB_POOL_EN, QUESTION_POOL_EN } from "./mock-data-en"
import { Language } from "./translations"

// Pool of fun mock player names used to populate a room when the
// real-time backend is not connected. Keeps the demo feeling alive.
export const MOCK_NAMES = [
  "Maya",
  "Leo",
  "Iris",
  "Noah",
  "Zara",
  "Finn",
  "Aria",
  "Eli",
  "Nova",
  "Theo",
]

// Avatar accent colors – kept minimal & on-brand (lime / amber / coral / muted).
const AVATAR_COLORS = [
  "var(--primary)",
  "var(--accent)",
  "var(--destructive)",
  "var(--muted-foreground)",
]

export function makeMockPlayer(
  index: number,
  overrides: Partial<Player> = {},
): Player {
  return {
    id: `p_${Math.random().toString(36).slice(2, 9)}`,
    name: MOCK_NAMES[index % MOCK_NAMES.length],
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
    isHost: false,
    isGuesser: false,
    connected: true,
    score: 0,
    hasBeenGuesser: false,
    ...overrides,
  }
}

// 100 common Romanian verbs (acțiuni)
export const VERB_POOL_RO = [
  "a alerga", "a dansa", "a găti", "a citi", "a cânta", "a dormi", "a râde", "a plânge", "a sări", "a înota",
  "a scrie", "a desena", "a picta", "a vorbi", "a asculta", "a privi", "a vedea", "a auzi", "a simți", "a mirosi",
  "a gusta", "a mânca", "a bea", "a merge", "a zbura", "a conduce", "a repara", "a construi", "a dărâma", "a tăia",
  "a lipi", "a coase", "a călca", "a spăla", "a curăța", "a mătura", "a săpa", "a planta", "a uda", "a culege",
  "a vinde", "a cumpăra", "a plăti", "a câștiga", "a pierde", "a căuta", "a găsi", "a ascunde", "a uita", "a-și aminti",
  "a învăța", "a preda", "a ajuta", "a salva", "a ataca", "a apăra", "a lupta", "a învinge", "a cădea", "a se ridica",
  "a sta", "a ședea", "a se întinde", "a se mișca", "a se opri", "a începe", "a termina", "a continua", "a repeta", "a încerca",
  "a reuși", "a eșua", "a spera", "a visa", "a crede", "a iubi", "a urî", "a ierta", "a pedepsi", "a promite",
  "a jura", "a minți", "a spune", "a întreba", "a răspunde", "a decide", "a alege", "a schimba", "a păstra", "a arunca",
  "a prinde", "a bate", "a mângâia", "a săruta", "a îmbrățișa", "a sforăi", "a călători", "a explora", "a descoperi", "a striga"
]

// 100 funny and unclear questions using "a tipota"
export const QUESTION_POOL_RO = [
  //Frecvență și obiceiuri
  "Tipotezi des?",
  "Cât de des tipotezi într-o săptămână?",
  "Tipotezi în fiecare zi?",
  "Ai tipotit azi?",
  "Tipotezi mai des decât acum un an?",
  "Cât timp îți ia de obicei să tipotești?",
  "Tipotezi mai mult vara sau iarna?",
  "Există zile în care nu tipotești deloc?",
  "Tipotești mai mult în weekend?",
  "Ai tipotit de mai mult de trei ori azi?",
  "Cât timp îți ia de obicei să tipotești?",
  "Câte ori pe zi tipotești în medie?",
  "Tipotești mai puțin decât înainte?",
  "Te-ai oprit vreodată din tipotit o perioadă lungă?",
  "Ai vreo rutină legată de tipotit?",
  "Tipotești impulsiv sau planificat?",

  //Când și unde tipotești?
  "Tipotești seara?",
  "Tipotești dimineața devreme?",
  "Tipotești noaptea?",
  "Există un loc anume unde tipotești de obicei?",
  "Tipotești acasă sau mai degrabă afară?",
  "Ai tipotit vreodată în public?",
  "Tipotești când ești singur sau preferă companie?",
  "Ai tipotit vreodată în vacanță?",
  "Tipotești mai mult când ești stresat?",
  "Tipotești și când ești obosit?",
  "Ai tipotit vreodată la muncă?",
  "Tipotești mai mult când ești fericit sau trist?",
  "Ai tipotit vreodată pe un drum lung?",
  "Tipotești și când ți-e foame?",
  "Tipotești mai ales înainte sau după masă?",

  //Cu cine tipotești?
  "Ai tipotit cu cineva din grupul ăsta?",
  "Când ai tipotit ultima oară cu cineva de aici?",
  "Am tipotat cu toții împreună vreodată?",
  "Cu cine din grup tipotești cel mai des?",
  "Există cineva de aici cu care nu ai tipotit niciodată?",
  "Ai tipotit vreodată cu cineva de aici fără să știe restul?",
  "Cine crezi că tipotește cel mai mult din grupul ăsta?",
  "Te-a invitat cineva de aici să tipotești împreună?",
  "Ai refuzat vreodată să tipotești cu cineva din grup?",
  "Cine din grup crezi că tipotește cel mai rar?",
  "Ai tipotit vreodată cu toți cei de față în același timp?",
  "Cu cine din grup ai vrea să tipotești mai des?",
  "Există cineva de aici care te-a convins să tipotești?",
  "Preferi să tipotești cu cineva sau singur?",
  "Ai tipotit cu cineva nou de curând?",

  //Sanatate si efecte
  "Este bine să tipotești?",
  "Este sănătos să tipotești în fiecare zi?",
  "Tipotitul te obosește?",
  "Te simți mai bine după ce tipotești?",
  "Tipotitul te relaxează?",
  "Există riscuri dacă tipotești prea mult?",
  "Tipotitul te face mai fericit?",
  "Ai simțit vreodată că ai tipotit prea mult?",
  "Tipotitul îți dă energie sau te consumă?",
  "Crezi că tipotitul este bun pentru sănătate?",
  "Ai regretit vreodată că ai tipotit?",
  "Tipotitul te ajută să adormi mai ușor?",
  "Îți e rușine să tipotești în fața altora?",
  "Ai mai multă energie după ce tipotești?",
  "Tipotitul te face să te simți vinovat uneori?",

  //Grup și dinamică
  "Credeți că vă tipotați suficient ca grup?",
  "Ai tipotit cineva din grup fără să ne spună?",
  "Am vorbit vreodată în grup despre tipotit?",
  "Cine crezi că ar fi cel mai surprins dacă l-ai vedea tipotind?",
  "Există reguli nerostite în grup despre tipotit?",
  "Ai tipotit vreodată din cauza presiunii grupului?",
  "Crezi că toți din grup tipotesc la fel de mult?",
  "V-ați tipotit cu toții în același loc vreodată?",
  "Există cineva din grup care vorbește prea mult despre tipotit?",
  "Crezi că grupul ar tipota mai mult dacă s-ar vedea mai des?",
  "Ai simțit că cineva din grup te judecă pentru că tipotești?",
  "Cine din grup crezi că e cel mai bun la tipotit?",
  "Ai aflat ceva surprinzător despre cineva din grup legat de tipotit?",
  "Credeți că grupul ăsta tipotează mai mult decât media?",
  "V-ați propus vreodată să tipotați împreună mai des?",

  //Amuzante și absurde
  "Ai tipotit vreodată accidental?",
  "Ți s-a întâmplat să tipotești și să-ți pară rău imediat?",
  "Ai tipotit vreodată și te-a văzut cineva pe care nu voiai?",
  "Poți tipoti și să vorbești în același timp?",
  "Ai tipotit vreodată de față cu părinții tăi?",
  "Tipotești diferit când ești singur față de când ești cu alții?",
  "Ai tipotit vreodată și ai uitat complet că ai făcut-o?",
  "Există o vârstă potrivită pentru tipotit?",
  "Ai folosit vreodată o scuză ca să poți tipoti?",
  "Ai tipotit vreodată pe ascuns?",
  "Crezi că animalele pot tipoti?",
  "Dacă tipotitul ar fi un sport olimpic, ai câștiga medalie?",
  "Ai tipotit vreodată pe timp de ploaie?",
  "Îți place să tipotești sau o faci din obișnuință?",
  "Dacă ai putea tipoti o singură dată pe zi, când ai alege?",
  "Ai tipotit vreodată și ți-a venit să râzi imediat după?",
  "Există o versiune premium de tipotit sau e la fel pentru toată lumea?",
  "Crezi că tipotitul te definește ca persoană?",
  "Tipotitul tău s-a schimbat față de acum 5 ani?",
  "Dacă cineva din grup ar tipoti în somn, cine crezi că ar fi?",
  "Dacă ai fi forțat să tipotești zilnic la o anumită oră, ce oră ai alege?",
  "Ai tipotit vreodată intenționat doar pentru a enerva pe cineva?",
  "Dacă tipotitul ar face un zgomot specific, ce fel de zgomot ar fi?",
  "Te-ai simțit vreodată vinovat după ce ai tipotit prea mult?",
  "Dacă tipotitul ar fi ilegal, cât de repede te-ar prinde poliția?"
]

export const VERB_POOL = {
  en: VERB_POOL_EN,
  ro: VERB_POOL_RO,
}

export const QUESTION_POOL = {
  en: QUESTION_POOL_EN,
  ro: QUESTION_POOL_RO,
}

export function makeQuestionItems(texts: string[]): QuestionItem[] {
  return texts.map((text, i) => ({
    id: `q_${i}_${Math.random().toString(36).slice(2, 6)}`,
    text,
    used: false,
    skipped: false,
  }))
}

// Used to generate a friendly room code like "WORD-3F2A"
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// Compares a guess to the secret verb. Lenient: ignores the leading
// particle "a ", whitespace, case, and trailing punctuation.
export function isCorrectVerbGuess(guess: string, secret: string): boolean {
  const normalize = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/^a\s+/, "")
      .replace(/[\s.,!?]+$/, "")
  return normalize(guess) === normalize(secret)
}

export function generateLocalRound(word?: string, lang: Language = "en") {
  const selectedWord = word || VERB_POOL[lang][Math.floor(Math.random() * VERB_POOL[lang].length)]

  // Shuffle and pick 15 initial questions
  const shuffled = [...QUESTION_POOL[lang]].sort(() => Math.random() - 0.5)
  const initialQuestions = shuffled.slice(0, 100)

  return {
    word: selectedWord,
    questions: initialQuestions,
  }
}
