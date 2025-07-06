# Dndbeyond to Markdown documents

The goal of this project is to format the data sent by the dndbeyond character sheet API into useful local markdown documents.

## 🧙‍♂️  Create an almighty character
- Create a homebrew wizard subclass that has all spells accessible, or reuse this one:
https://www.dndbeyond.com/subclasses/1310816-op-all-everything

- Create a lvl 20 character with this subclass. We will get all datas from this character.
My own character: https://www.dndbeyond.com/characters/75635712

## 📜  Download general rules
- Go to your character page and open your developer console.
- Copy response from https://character-service.dndbeyond.com/character/v5/rule-data?v=@dndbeyond%2Fcharacter-app@1.43.2
- Paste it into `./rules-data.json`

## 🪄  Format spells
- Go to your character page and open your developer console.
- Go to "Spells" > "Manage spells" > "Add spells". It will trigger a loading for the full list of spells available to your character.
- Copy response from https://character-service.dndbeyond.com/character/v5/game-data/spells?sharingSetting=2&classId=1310816&classLevel=20
- Paste it in `./spells/raw-spells.json`
- run `npm run spells`. It has several steps:
  + It will run `npm run spells:filter` to remove duplicate spells. The results are stored in `./spells/filtered-spells.json`
  + It will run `npm run spells:build` to create format each spell into a markdown file. The results are stored in the `./spells/docs/` folder.
  + It will run `npm run spells:scrolls` to create random scrolls table in a markdow file. The results are stored in the `./spells/random-scrolls.md`.

## 👹  Format creatures data
- If you want to benefit from spell linking, run the "Format Spell" instructions first.
- Go to your character page and open your developer console.
- Go to "extras" and "manage extras" to download the full creature list.
- Copy the response from https://character-service.dndbeyond.com/character/v5/game-data/monsters?sharingSetting=2
- Paste it in `./spells/raw-creatures.json`
- Copy `authorization` request header to the `./creatures/post-creatures.json` script.
- Run `npm run creatures:post`. Creatures will be added to your character Extras list, and a json file will be locally created in `./creatures/posted/`, to skip the creatures already posted next time you use the script.
- Refresh your character sheet on dndbeyond.
- Copy the response from https://character-service.dndbeyond.com/character/v5/character/75635712?includeCustomItems=true to the file `./creatures/my-character-data.json`
- Run `npm run creatures:build` and any individual creature will be transformed in a markdown description in the `./creatures/docs/` folder

## 🎁  Format item datas
- Go to your character page and open your developer console.
- Go to "Items" > "Manage items" > "Add items". It will trigger a loading for the full list of items available to your character.
- Copy the response from https://character-service.dndbeyond.com/character/v5/game-data/items?sharingSetting=2 
- Paste it in `./spells/raw-items.json`
- Run `npm run items` and any individual item will be transformed in a markdown description and sorted in the `./items/docs/` folder.

## 🥷  Format feats
- Go to your character page and open your developer console.
- Go to "Items" > "Manage items" > "Add items". It will trigger a loading for the full list of items available to your character.
- Copy the response from https://character-service.dndbeyond.com/character/v5/game-data/items?sharingSetting=2 
- Paste it in `./spells/raw-items.json`
- Run `npm run items` and any individual item will be transformed in a markdown description and sorted in the `./items/docs/` folder.
