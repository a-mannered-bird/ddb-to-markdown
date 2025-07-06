
import {readFileSync, writeFileSync} from 'fs'
import TurndownService from 'turndown'
const td = new TurndownService()
td.keep(['table', 'thead', 'tr', 'th', 'td', 'tbody'])

const getPrerequisites = (prerequisites) => {
  if (!prerequisites.length) {
    return ``
  }
  return `\n**Prerequisite(s) :**\n` + prerequisites.map((p) => `- ${p.description}`)
    .join(`\n`) + `\n`
}

let feats = readFileSync(`./feats/raw-feats.json`)
feats = JSON.parse(feats).data
feats = feats.forEach((feat, i) => {
  const doc = `# ${feat.name}
${getPrerequisites(feat.prerequisites)}
${td.turndown(feat.description)}
`
  console.log(feat.name, i)
  // console.log(doc)
  writeFileSync(`./feats/docs/${feat.name.replace('/', ' ')}.md`, doc)
})
