@echo off
echo ===================================
echo Fixing package.json dependencies
echo ===================================

:: Create a backup of the original package.json
copy package.json package.json.backup
echo Created backup: package.json.backup

:: Use Node.js to fix the package.json
node -e "const fs = require('fs'); const pkg = require('./package.json'); if (pkg.dependencies.electron) { if (!pkg.devDependencies) pkg.devDependencies = {}; pkg.devDependencies.electron = pkg.dependencies.electron; delete pkg.dependencies.electron; }; if (pkg.dependencies['electron-builder']) { if (!pkg.devDependencies) pkg.devDependencies = {}; pkg.devDependencies['electron-builder'] = pkg.dependencies['electron-builder']; delete pkg.dependencies['electron-builder']; }; fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));"

echo Package.json has been fixed.
echo Now you can run build.bat again.
pause