
import {readFileSync, writeFileSync} from 'fs'
import TurndownService from 'turndown'
const td = new TurndownService()
td.keep(['table', 'thead', 'tr', 'th', 'td', 'tbody'])

const rules = JSON.parse(readFileSync(`./rules-data.json`)).data
const components = rules.spellComponents
const stats = rules.stats
const activationTypes = rules.activationTypes

const getComponents = (c, description) => {
  return c.map((id) => components.find(comp => comp.id === id).name)
    .join(', ') + (description ? ` (${description})` : ``)
}

const getActivation = (a) => {
  const activationType = activationTypes.find(type => type.id === a.activationType).name
  return `${a.activationTime && `${a.activationTime} `}${activationType}`
}

const getDuration = (d) => {
  if (d.durationInterval) {
    return `${d.durationInterval} ${d.durationUnit}`
  } else {
    return d.durationType
  }
}

const getRange = (r) => {
  const range = `${r.origin} ${r.rangeValue ? `${r.rangeValue} ft` : ``}`
  const zone = r.aoeType ? `, ${r.aoeType} ${r.aoeValue ? `${r.aoeValue} ft` : ``}` : ``
  return range + zone
}

const getChallenge = (s) => {
  let result = ``
  if (s.requiresSavingThrow) {
    result += `${stats.find(stat => stat.id === s.saveDcAbilityId).key} save`
  }
  if (s.requiresAttackRoll) {
    result += `Attack roll`
  }
  return result ? `**Challenge :** ${result}\n` : ``
}


let spells = readFileSync(`./spells/filtered-spells.json`)
spells = JSON.parse(spells)
spells = spells.forEach((spell, i) => {
  // const number = Math.floor(Math.random()*spells.length)
  // const spell = spells[number]
  const {concentration, ritual} = spell
  const flags = {concentration, ritual}
  const doc = `# ${spell.name}
*[[Schools of magic#${spell.school}|${spell.school}]], lvl ${spell.level}*
**Components :** ${getComponents(spell.components, spell.componentsDescription)}
**Activation :** ${getActivation(spell.activation)}${spell.ritual ? `, Ritual`: ``}
**Duration :** ${getDuration(spell.duration)}${spell.concentration ? `, Concentration` : ``}
**Range :** ${getRange(spell.range)}
${getChallenge(spell)}
${td.turndown(spell.description)}
`
  console.log(spell.name, i)
  // console.log(spell)
  // console.log(doc)
  // console.log(rules);
  writeFileSync(`./spells/docs/${spell.name.replace('/', ' ')}.md`, doc)
})
