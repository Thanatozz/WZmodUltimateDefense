# Preset examples

Copies of the presets that ship inside the mod, so you can read and edit them
without unpacking the `.wz`.

`default-commented.json` explains every setting; `default.json` is the same file
without the notes. `blitz.json` and `longdefense.json` are worked examples.

## Where presets are read from

Everything `includeJSON()` is asked for is measured from `multiplay/script/rules`
inside the virtual filesystem - a leading slash makes no difference. So inside
the mod they live at:

    mod/multiplay/script/rules/presets/

Warzone also mounts your configuration directory ahead of the mod, so the same
lookup finds this first:

    <Warzone config>/multiplay/script/rules/presets/mypreset.json

That is where a preset of your own goes. No repacking, and a file there wins
over one of the same name inside the `.wz`.

On Windows the configuration directory is:

    %APPDATA%\Warzone 2100 Project\Warzone 2100

## Using one

As player 1, within the first 30 seconds of a game:

    !ud play mypreset

**Only you need the file.** What reaches the other players is the settings that
differ from the defaults, one `!ud set` line each, so they play by your rules
without installing anything. A preset that will not load changes nothing: the
game runs on the defaults that shipped with the mod.
