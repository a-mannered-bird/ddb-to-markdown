
import { log } from 'console'
import {readFileSync, writeFileSync, readdirSync} from 'fs'
import TurndownService from 'turndown'
const td = new TurndownService()
td.keep(['table', 'thead', 'tr', 'th', 'td', 'tbody'])
const rules = JSON.parse(readFileSync(`./rules-data.json`)).data

const getSize = (id) => rules.creatureSizes.find(x => x.id === id).name
const getType = (id) => rules.monsterTypes.find(x => x.id === id)
const getAlignment = (id) => rules.alignments.find(x => x.id === id)?.name
const getSubType = (ids) => ids.reduce((names, {id}) => {
  const subType = rules.monsterSubTypes.find(x => x.id === id)?.name
  return (names ? `${names}, ` : names) + (subType ?? ``)
}, ``)
const getMovement = (moves) => moves.reduce((pre, move) => {
  const movement = rules.movements.find(x => x.id === move.movementId)?.name
  return (pre ? `${pre}, ` : pre) + `${movement} (${move.speed} ft)`
}, ``)
const getStatName = (id) => rules.stats.find(x => x.id === id).name
const getStats = (stats) => stats.sort((a,b) => a.id - b.id).map(stat => stat.value)

const getCR = (id) => {
  const cr = rules.challengeRatings.find(x => x.id === id).value
  if (cr < 1) {
    return `1/${1/cr}`
  }
  return cr
}
const calculateBonus = (statScore, crId, bonus) => {
  return Math.floor((statScore - 10)/2) + (bonus || getCR(crId).proficiencyBonus)
}
const getSaves = (saves, stats, crId) => saves.reduce((pre, {statId, bonusModifier}) => {
  const statScore = stats.find((x) => x.statId === statId).value
  const defaultModifier = calculateBonus(statScore, crId)
  return `${pre}\n  - ${getStatName(statId).toLowerCase()}: ${bonusModifier || defaultModifier}`
}, ``)

const getSkillName = (id) => rules.abilitySkills.find(x => x.id === id).name
const getSkillSaves = (skills) => skills.reduce((pre, skill) => {
  const score = skill.value + (skill.additionalBonus || 0) 
  return `${pre}\n  - ${getSkillName(skill.skillId).toLowerCase()}: ${score}`
}, ``)

const dmgAdjustmentType = ['Resistance', 'Immunity', 'Vulnerability']
const getDmgAdjustment = (id) => rules.damageAdjustments.find(x => x.id === id)
const getDmgAdjustments = (ids, type) => ids.map(id => getDmgAdjustment(id))
  .filter(dmg => dmg.type === type)
  .reduce((names, dmg) => {
    return (names ? `${names}, ` : names) + dmg.name
  }, ``)

const getCondition = (id) => rules.conditions.find(x => x.definition.id === id).definition
const getConditions = (ids) => ids.map(id => getCondition(id))
  .reduce((names, item) => {
    return (names ? `${names}, ` : names) + item.name
  }, ``)

const getSenseName = (id) => rules.senses.find(x => x.id === id).name
const getSenses = (senses) => senses.reduce((names, item) => {
  return (names ? `${names}, ` : names) +
  getSenseName(item.senseId) + (item.notes ? ` ${item.notes}` : ``)
}, ``)

const getLanguageName = (id) => rules.languages.find(x => x.id === id).name
const getLanguages = (senses) => senses.reduce((names, item) => {
  return (names ? `${names}, ` : names) +
  getLanguageName(item.languageId) + (item.notes ? ` ${item.notes}` : ``)
}, ``)

const parseDescription = (desc) => {
  const items = desc.split('**')
}

const removeAccents = (s) =>{
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace('æ', 'ae');
};
const getSlug = (name) => {
  return removeAccents(name).toLowerCase().replace(/[  ]/g, '-').replace(/['()’,]/g, '')
}

const spellDocNames = readdirSync(`./spells/docs`)
  .map(n => n.split('.')[0])
  .sort((a, b) => b.length - a.length)

const parseWithExtras = (text) => {

  // Insert spell links
  let newText = text
  spellDocNames.forEach(spell => {
    const regexSpell = spell.replace(/ /g, '\\s');
    const regexPattern = `\\b${regexSpell}\\b(?![^\\[]*\\])`;
    const regex = new RegExp(regexPattern, 'gi');
    newText = newText.replace(regex, `[[${spell}]]`);
  })

  // Replace dice rolls in descriptions
  newText = newText.replace(/[0-9]*d[0-9]{1,3}( ?\+ ?[0-9]*)?/gi, `\`dice:$&\``) // Any other roll
  newText = newText.replace(/\+([0-9]*) to hit/gi, `\`dice:1d20 + $1\` to hit`) // Hits rolls
  return newText
}

let creatures = readFileSync(`./creatures/my-character-data.json`)

// Sort alphabetically by creature name
creatures = JSON.parse(creatures).data.creatures.sort((a, b) => a.definition.name.localeCompare(b.definition.name))

// Will contain the name of creatures with their sourceId already stored to avoid doubles
const storedCreaturesSource = {}

creatures.forEach(({definition: c}, i) => {

  // debug
  // const c = creatures[211].definition
  // const i = 211
  // if ([677, 678].includes(i)) {
  //   console.log(c)
  // }

  const type = getType(c.typeId)
  const creatureName = c.name
  console.log(c.name, /*c.isLegacy,*/ i)

  let doc = `# ${creatureName}
\`\`\`statblock
image: ${c.avatarUrl ? `![](${c.avatarUrl})` : ``}
name: ${creatureName}
size: ${getSize(c.sizeId)}
type: [[${type.pluralizedName[0].toUpperCase() + type.pluralizedName.substr(1)}|${type.name}]]
subtype: ${getSubType(c.subTypes)}
alignment: ${getAlignment(c.alignmentId) || ``}
ac: ${c.armorClass} ${c.armorClassDescription}
hp: ${c.averageHitPoints}
hit_dice: ${c.hitPointDice.diceString}
speed: ${getMovement(c.movements)}
stats: [${getStats(c.stats)}]
damage_vulnerabilities: ${getDmgAdjustments(c.damageAdjustments, 3)}
damage_resistances: ${getDmgAdjustments(c.damageAdjustments, 1)}
damage_immunities: ${getDmgAdjustments(c.damageAdjustments, 2)}
condition_immunities: ${getConditions(c.conditionImmunities)}
senses: ${getSenses(c.senses)}${c.senses.length ? `, ` : ``}Passive Perception ${c.passivePerception}
languages: ${getLanguages(c.languages)}${c.languages.length && c.languageNote ? `, ` : ``}${c.languageNote}
cr: ${getCR(c.challengeRatingId)}
`
if(c.savingThrows.length) doc += `saves:${getSaves(c.savingThrows, c.stats, c.challengeRatingId)}\n`
if(c.skills.length) doc += `skillsaves:${getSkillSaves(c.skills)}\n`
doc += `traits:
  - name: Full description
    desc: [[Rules/Creatures/Stat blocks/${creatureName.replace('/', ' ')}]]
`
doc += `\`\`\`

${c.specialTraitsDescription ? `### Traits
${parseWithExtras(td.turndown(c.specialTraitsDescription))}  

` : ``}${c.actionsDescription ? `### Actions
${parseWithExtras(td.turndown(c.actionsDescription))}  

` : ``}${c.bonusActionsDescription ? `### Bonus Actions
${parseWithExtras(td.turndown(c.bonusActionsDescription))}  

` : ``}${c.reactionsDescription ? `### Reactions
${parseWithExtras(td.turndown(c.reactionsDescription))}  

` : ``}${c.mythicActionsDescription ? `### Mythic Actions
${parseWithExtras(td.turndown(c.mythicActionsDescription))}  

` : ``}${c.legendaryActionsDescription ? `### Legendary Actions
${parseWithExtras(td.turndown(c.legendaryActionsDescription))}  

` : ``}${c.characteristicsDescription ? `### Description
${parseWithExtras(td.turndown(c.characteristicsDescription))}  

` : ``}${c.lairDescription ? `### Lair
${parseWithExtras(td.turndown(c.lairDescription))}  

` : ``}${c.largeAvatarUrl ? `![](${c.largeAvatarUrl})` : ``}
[dndbeyond source](https://www.dndbeyond.com/monsters/${c.id}-${getSlug(c.name)})
[[${type.pluralizedName[0].toUpperCase() + type.pluralizedName.substr(1)}|${type.name}]]
`
  // console.log(doc)
  if (!storedCreaturesSource[creatureName] || c.sourceId > storedCreaturesSource[creatureName]) {
    writeFileSync(`./creatures/docs/${creatureName.replace('/', ' ')}.md`, doc)
  } else {
    console.log('⛔️  Duplicate rejected', storedCreaturesSource[creatureName], c.sourceId)
  }

  storedCreaturesSource[creatureName] = c.sourceId
})
