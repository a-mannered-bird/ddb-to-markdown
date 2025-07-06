
import {readFileSync, writeFileSync, mkdirSync} from 'fs'
import TurndownService from 'turndown'
const td = new TurndownService()
td.keep(['table', 'thead', 'tr', 'th', 'td', 'tbody'])

const rules = JSON.parse(readFileSync(`./rules-data.json`)).data
const armorTypes = rules.armorTypes
const gearTypes = rules.gearTypes

const getType = (item) => {
  const gearType = item.gearTypeId && item.type === 'Gear' ? gearTypes.find(type => type.id === item.gearTypeId).name : ``
  return gearType || item.type || item.filterType
}

const getDocLinks = (item, type) => {  
  const links = []
  const types = [type, item.type, item.filterType, item.subType]
  console.log(types);
  if (types.includes('Armor')) links.push(`[[Armor rules]]`)
  if (types.includes('Gemstone')) links.push(`[[Weight helpers#Gems weight|Gems weight]]`)
  if (types.includes('Mount')) {
    links.push(`[[Mount and vehicles]]`)
    links.push(`[[Mounted combat]]`)
  }
  if (types.includes('Tool')) links.push(`[[${item.name} rules]]`)
  if (types.includes('Vehicle (Water)') || types.includes('Vehicle (Land)')) links.push(`[[Mount and vehicles]]`)
  if (types.includes('Scroll')) links.push(`[[Spell scrolls rules]]`)
  if (types.includes('Weapon')) links.push(`[[Weapons rules]]`)

  return links.length ? `\n**More about:** ${links.join(`, `)}` : ``
}

const getProperties = (item) => {
  let properties = item.properties ? item.properties.map(prop => {
    let str = prop.name
    if (prop.notes) str += ` (${prop.notes})`
    return str
  }) : []
  if (item.magic) properties.push(`magic`)
  if (item.canAttune) properties.push(`requires attunment`)
  if (item.isConsumable) properties.push(`consumable`)
  if (item.isMonkWeapon) properties.push(`monk weapon`)
  return properties.length ? `\n**Properties :** ${properties.join(', ')}` : ``
}

const getArmorInfo = (item) => {
  let info = ``
  if (item.armorClass) info += `\n**Armor**: AC ${item.armorClass}`
  if (item.baseArmorName) info += ` ${item.baseArmorName}`
  if (item.armorTypeId) info += ` (${armorTypes.find(type => type.id === item.armorTypeId).name})`
  return info
}

const getDamageInfo = (item) => {
  let damage = ``
  if (item.damage) damage += `\n**Damage**: ${item.damage.diceString} ${item.damageType}`
  if (item.fixedDamage) damage += `\n**Damage**: ${item.fixedDamage} ${item.damageType}`
  return damage
}

const getRangeInfo = (item) => {
  let range = ``
  if (item.range) range += `\n**Range: ${item.range}`
  if (item.longRange && item.longRange !== item.range) range += ` (${item.longRange})`
  return range
}

const getCost = (item) => item.cost ? ` - ${item.cost} GP` : ``
const getWeight = (item) => {
  const weight= item.weight * item.weightMultiplier
  return weight ? ` - ${weight} lb` : ``
}

let items = readFileSync(`./items/raw-items.json`)
items = JSON.parse(items).data
items = items.forEach((item, i) => {
  // const number = Math.floor(Math.random()*items.length)
  // const item = items[1354]
  const type = getType(item)
  let doc = `# ${item.name}`
  doc += `\n**${item.magic ? `${item.rarity} ` : ``}${type}${getCost(item)}${getWeight(item)}**`
  doc += getDocLinks(item, type)
  doc += getProperties(item)
  doc += getArmorInfo(item)
  doc += getDamageInfo(item)
  doc += getRangeInfo(item)
  doc += `\n\n${td.turndown(item.description)}`
  doc += item.largeAvatarUrl ? `\n\n![](${item.largeAvatarUrl})` : ``

  console.log(item.name, i, item.filterType)
  // console.log(item)
  // console.log(doc)
  // console.log(rules);
  const folder = item.filterType === 'Other Gear' ? type : item.filterType
  mkdirSync(`./items/docs/${folder}`, {recursive: true})
  writeFileSync(`./items/docs/${folder}/${item.name.replace('/', ' ')}.md`, doc)
})
