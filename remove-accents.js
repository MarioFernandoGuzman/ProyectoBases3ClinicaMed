const fs = require('fs');
const path = require('path');

function removeAccents(str) {
  // Elimina acentos (áéíóú), diéresis (ü) y la ñ
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // elimina diacríticos
    .replace(/ñ/g, 'n')
    .replace(/Ñ/g, 'N');
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Reemplazar comentarios de una línea //
  content = content.replace(/\/\/(.*)/g, (match, p1) => {
    modified = true;
    return '//' + removeAccents(p1);
  });
  
  // Reemplazar comentarios multilínea /* ... */
  content = content.replace(/\/\*([\s\S]*?)\*\//g, (match, p1) => {
    modified = true;
    return '/*' + removeAccents(p1) + '*/';
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Procesado: ${filePath}`);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === 'dist') continue;
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

walk('C:\\Users\\mario\\.gemini\\antigravity\\scratch\\clinica-api');
walk('C:\\Users\\mario\\.gemini\\antigravity\\scratch\\clinica-frontend\\src');
console.log('¡Limpieza de comentarios terminada!');
