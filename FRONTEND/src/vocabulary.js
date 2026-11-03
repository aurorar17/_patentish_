const vocabulary = {
  raffigurato: 'shown', raffigurata: 'shown', raffigurati: 'shown', raffigurate: 'shown',
  figura: 'image', figure: 'images', segnale: 'sign', segnali: 'signs',
  veicolo: 'vehicle', veicoli: 'vehicles', incrocio: 'intersection', incroci: 'intersections',
  conducente: 'driver', conducenti: 'drivers', velocità: 'speed', precedenza: 'right of way',
  preannuncia: 'warns of', preannunciano: 'warn of', carreggiata: 'carriageway', carreggiate: 'carriageways',
  corsia: 'lane', corsie: 'lanes', sorpasso: 'overtaking', sorpassare: 'to overtake',
  circolazione: 'traffic', circolare: 'to drive', transito: 'passage', sosta: 'parking',
  fermata: 'stopping', marcia: 'driving', semaforo: 'traffic light', semafori: 'traffic lights',
  pannello: 'supplementary sign', pannelli: 'supplementary signs', integrativo: 'supplementary',
  integrativa: 'supplementary', integrativi: 'supplementary', striscia: 'line', strisce: 'lines',
  pericolo: 'danger', pericoli: 'dangers', svoltare: 'to turn', svolta: 'turn', traffico: 'traffic',
  distanza: 'distance', distanze: 'distances', obbligo: 'requirement', obblighi: 'requirements',
  obbligatorio: 'mandatory', obbligatoria: 'mandatory', vietato: 'prohibited', vietata: 'prohibited',
  consentito: 'permitted', consentita: 'permitted', extraurbana: 'outside built-up areas',
  extraurbane: 'outside built-up areas', pedone: 'pedestrian', pedoni: 'pedestrians',
  attraversamento: 'crossing', attraversamenti: 'crossings', attraversare: 'to cross',
  marciapiede: 'pavement', marciapiedi: 'pavements', direzione: 'direction', direzioni: 'directions',
  divieto: 'prohibition', divieti: 'prohibitions', limite: 'limit', limiti: 'limits',
  massimo: 'maximum', massima: 'maximum', superiore: 'higher', inferiore: 'lower',
  strada: 'road', strade: 'roads', obbliga: 'requires', obbligano: 'require', occorre: 'it is necessary',
  necessario: 'necessary', necessaria: 'necessary', consentono: 'allow', consente: 'allows',
  vieta: 'prohibits', vietano: 'prohibit', senso: 'direction', doppio: 'two-way', doppia: 'double',
  inversione: 'U-turn', retromarcia: 'reverse', frenata: 'braking', frenare: 'to brake',
  pneumatico: 'tyre', pneumatici: 'tyres', motore: 'engine', motociclo: 'motorcycle',
  motocicli: 'motorcycles', ciclomotore: 'moped', ciclomotori: 'mopeds', pedonale: 'pedestrian',
  perpendicolare: 'perpendicular', parallele: 'parallel', parallela: 'parallel', luminoso: 'light',
  luminosa: 'light', lampeggiante: 'flashing', lampeggianti: 'flashing', sostare: 'to park',
  marciare: 'to drive', patente: 'driving licence', pannello: 'supplementary sign',
}

export function normalizeItalianWord(value) {
  return value.toLocaleLowerCase('it').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function getWordGlosses(question) {
  const stored = question.parole_difficili && typeof question.parole_difficili === 'object'
    ? question.parole_difficili
    : {}
  const merged = { ...vocabulary, ...stored }
  return Object.fromEntries(Object.entries(merged).map(([word, translation]) => [normalizeItalianWord(word), translation]))
}
