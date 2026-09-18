from pathlib import Path
import shutil
import subprocess
import zipfile

PROJECT = Path('/home/ubuntu/sistema-ahorro-cooperativo')
STAGE = Path('/home/ubuntu/sisacoop-hostinger-package')
ZIP_PATH = Path('/home/ubuntu/sistema-ahorro-cooperativo-sisacoop.zip')

if STAGE.exists():
    shutil.rmtree(STAGE)
STAGE.mkdir(parents=True)

# Files needed to run the compiled Node application and install dependencies.
files = [
    'package.json', 'pnpm-lock.yaml', 'tsconfig.json', 'drizzle.config.ts',
    'README_HOSTINGER.md', 'HOSTINGER_ENV_TEMPLATE.txt',
]
dirs = ['dist', 'drizzle', 'server', 'shared']

for name in files:
    source = PROJECT / name
    if source.exists():
        shutil.copy2(source, STAGE / name)
for name in dirs:
    source = PROJECT / name
    if source.exists():
        shutil.copytree(source, STAGE / name, ignore=shutil.ignore_patterns('*.map', '.DS_Store'))

# Include client source and the rest of the project source for maintainability,
# but never include local dependencies, logs, credentials, or generated tooling files.
for name in ['client', 'components.json', 'vite.config.ts', 'vitest.config.ts', 'patches']:
    source = PROJECT / name
    if source.exists():
        if source.is_dir():
            shutil.copytree(source, STAGE / name, ignore=shutil.ignore_patterns('node_modules', '.manus-*', '*.map'))
        else:
            shutil.copy2(source, STAGE / name)

with zipfile.ZipFile(ZIP_PATH, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for path in sorted(STAGE.rglob('*')):
        if path.is_file():
            archive.write(path, path.relative_to(STAGE))

print(f'Created {ZIP_PATH}')
print(f'Stage files: {sum(1 for p in STAGE.rglob("*") if p.is_file())}')
print(f'ZIP bytes: {ZIP_PATH.stat().st_size}')
