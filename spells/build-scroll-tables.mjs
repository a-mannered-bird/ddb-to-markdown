
import {readFileSync, writeFileSync} from 'fs'
import TurndownService from 'turndown'

let spells = readFileSync(`./spells/filtered-spells.json`)
spells = JSON.parse(spells)
const spellsByLevel = []
for (let i = 0; i < 10; i++) {
  spellsByLevel.push([])
}

spells.forEach((spell) => {
  spellsByLevel[spell.level].push(spell.name.replace('/', ' '))
})

let doc = ``
spellsByLevel.forEach((spells, i) => {
  // doc += `# ${spell.name}, lvl ${spell.level}`
  let table = `\n\n| Spell lvl ${i} |`
  spells.sort().forEach((spell, j) => {
    table += `\n| [[${spell}]] |`
  })
  table += `\n^spells${i}`
  doc += table
})
console.log(doc);

writeFileSync(`./spells/random-scrolls.md`, doc)
