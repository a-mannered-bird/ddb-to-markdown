
import {readFileSync, writeFileSync} from 'fs'

let spells = readFileSync(`./spells/raw-spells.json`)
spells = JSON.parse(spells).data
const ids = new Set()
spells = spells
  .filter((spell) => {
    const id = spell.definition.id
    if (ids.has(id)) {
      return false
    } else {
      ids.add(id)
      return true
    }
  })
  .map((s) => s.definition)

writeFileSync('./spells/filtered-spells.json', JSON.stringify(spells))
console.log(`Filtered all duplicate spells into file filtered-spells.json -> ${spells.length} spells total`)
