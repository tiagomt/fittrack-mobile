from pathlib import Path
from PIL import Image

project = Path('/home/ubuntu/fittrack-mobile')
source = project / 'assets/images/icon.png'
targets = [
    project / 'assets/images/icon.png',
    project / 'assets/images/splash-icon.png',
    project / 'assets/images/favicon.png',
    project / 'assets/images/android-icon-foreground.png',
]

image = Image.open(source).convert('RGBA')
image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
image.save(source, format='PNG', optimize=True, compress_level=9)

for target in targets[1:]:
    image.save(target, format='PNG', optimize=True, compress_level=9)

# If the launcher source is still over the checkpoint media threshold,
# apply a visually lossless palette reduction suitable for an app icon.
for target in targets:
    if target.stat().st_size > 1_000_000:
        current = Image.open(target).convert('RGBA')
        reduced = current.convert('P', palette=Image.Palette.ADAPTIVE, colors=256).convert('RGBA')
        reduced.save(target, format='PNG', optimize=True, compress_level=9)

for target in targets:
    print(f'{target.name}: {target.stat().st_size} bytes')
