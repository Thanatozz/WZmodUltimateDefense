# Preset examples

Copies of the presets that ship inside the mod, so you can read and edit them
without unpacking the `.wz`.

`default-commented.json` explains every setting; `default.json` is the same file
without the notes. `blitz.json` and `longdefense.json` are worked examples.

## Using your own

Put it in a `presets` folder in your Warzone configuration directory:

    <Warzone config>/presets/mypreset.json

Warzone mounts that directory ahead of the mod, so a preset there is found
before one of the same name inside the `.wz` - you can add new ones or replace
the shipped ones without repacking anything.

Then, as player 1, within the first 30 seconds of a game:

    !ud play mypreset

**Only you need the file.** What reaches the other players is the settings that
differ from the defaults, one `!ud set` line each, so they play by your rules
without installing anything. A preset that will not load changes nothing: the
game runs on the defaults that shipped with the mod.
