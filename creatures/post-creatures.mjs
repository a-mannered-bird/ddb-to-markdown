
import fetch from 'node-fetch'
import https from 'https'
import {readFileSync, writeFileSync, readdirSync} from 'fs'

const postedCreatures = readdirSync(`./creatures/posted/`)

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const postCreature = async (id) => {
  try {
    const response = await fetch(`https://character-service.dndbeyond.com/character/v5/creature`, {
      body: JSON.stringify({
        characterId: 75635712,
        groupId: 3,
        monsterId: id,
        names: [null]
      }),
      json: true,
      headers: {
        'Content-Type': `application/json`,
        'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjEwNjcwOTIyOSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJHaXBzeWNob2xvZ3kiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJkbW4uYmVybmFyZEBnbWFpbC5jb20iLCJkaXNwbGF5TmFtZSI6IkdpcHN5Y2hvbG9neSIsImF2YXRhclVybCI6Imh0dHBzOi8vd3d3LmRuZGJleW9uZC5jb20vYXZhdGFycy90aHVtYm5haWxzLzIzNDI3Lzg2NS8xMDAvMTAwLzYzNzc5NDExNTg2NjI3MzQ3My5qcGVnIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiUmVnaXN0ZXJlZCBVc2VycyIsImh0dHA6Ly9zY2hlbWFzLmRuZGJleW9uZC5jb20vd3MvMjAxOS8wOC9pZGVudGl0eS9jbGFpbXMvc3Vic2NyaWJlciI6IlRydWUiLCJodHRwOi8vc2NoZW1hcy5kbmRiZXlvbmQuY29tL3dzLzIwMTkvMDgvaWRlbnRpdHkvY2xhaW1zL3N1YnNjcmlwdGlvbnRpZXIiOiJNYXN0ZXIiLCJuYmYiOjE2NzkxMzEyOTMsImV4cCI6MTY3OTEzMTU5MywiaXNzIjoiZG5kYmV5b25kLmNvbSIsImF1ZCI6ImRuZGJleW9uZC5jb20ifQ.TDEoLDCNLtCm8Ymr8BBrefed9Tx6-IBIsyyDKvtI5Q0',
      },
      method: `POST`,
    })
    const data = await response.json()
    return data
  }
  catch (err) {
    return err
  }
}

let creatures = readFileSync(`./creatures/raw-creatures.json`)
let hasFailed = false
creatures = JSON.parse(creatures).data
creatures = asyncForEach(creatures, async (creature, i) => {
  if (hasFailed) return

  // Don't repost a creature that already has been posted
  const isAlreadyPosted = !!postedCreatures.find((x) => parseInt(x.split('.')[0]) === creature.id)
  if (isAlreadyPosted) {
    console.log(`${creature.id} ${creature.name} -> Already exists  ☑️`);
    return
  }

  // Post a new creature to my character
  const result = await postCreature(creature.id)

  // Stop query new creatures if it has failed
  hasFailed = !result.success
  if (hasFailed) {
    console.log(`${creature.id} ${creature.name} -> Error  ❌`, result);
    return
  }

  const creatureData = result.data[0].definition
  writeFileSync(`./creatures/posted/${creatureData.id}.json`, JSON.stringify(creatureData))
  console.log(`${creature.id} ${creature.name} -> Successfully posted and saved  ✅`);
})