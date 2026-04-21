const fs = require('fs');
const path = require('path');

const sectionsDir = path.join(__dirname, 'sections');
const htmlFiles = [];

const walkSync = function(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      filelist = walkSync(dir + '/' + file, filelist);
    }
    else {
      if (file.endsWith('.html')) filelist.push(dir + '/' + file);
    }
  });
  return filelist;
};

try {
  walkSync(sectionsDir, htmlFiles);
} catch(e) {
  console.log("No sections dir found");
}

const replacements = [
  { p: /PRECIO INFLADO B2B/g, r: 'PRECIO INFLADO A DISTRIBUIDORES' },
  { p: /lote B2B/g, r: 'lote mayorista' },
  { p: /TUBOS DE CORTINA PERÚ — B2B/g, r: 'TUBOS DE CORTINA PERÚ — MAYORISTAS' },
  { p: /PRECIO OFICIAL B2B/g, r: 'PRECIO MAYORISTA OFICIAL' },
  { p: /PRECIO B2B OFICIAL/g, r: 'PRECIO MAYORISTA OFICIAL' },
  { p: /TUBOS PERÚ B2B/gi, r: 'TUBOS PERÚ MAYORISTAS' },
  { p: /LA TENDENCIA B2B/g, r: 'LA TENDENCIA PARA NEGOCIOS' },
  { p: /Red B2B/g, r: 'Red de Distribuidores' },
  { p: /TU PRECIO B2B LIMA/g, r: 'TU PRECIO POR MAYOR' },
  { p: /INVERSIÓN B2B/g, r: 'INVERSIÓN POR MAYOR' },
  { p: /EMPRENDEDORES B2B/g, r: 'EMPRENDEDORES Y NEGOCIOS' },
  { p: /Distribución B2B/g, r: 'Distribución al por Mayor' },
  { p: /IMPORTACIÓN DIRECTA · B2B/g, r: 'IMPORTACIÓN DIRECTA · POR MAYOR' },
  { p: /distribuidores B2B/g, r: 'distribuidores locales' },
  { p: /COTIZAR LOTE B2B/g, r: 'COTIZAR LOTE POR MAYOR' },
  { p: /PAGO CONTRA ENTREGA B2B/g, r: 'PAGO CONTRA ENTREGA' },
  { p: /GANANCIA B2B/g, r: 'GANANCIA COMO DISTRIBUIDOR' },
  { p: /Volumen B2B/g, r: 'Volumen por Mayor' },
  { p: /<span class="text-highlight">B2B<\/span>/g, r: '<span class="text-highlight">POR MAYOR</span>' },
  { p: /B2B /g, r: 'MAYORISTA ' }, // catchall trailing space
  { p: / B2B/g, r: ' POR MAYOR' } // catchall leading space
];

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  replacements.forEach(rep => {
    newContent = newContent.replace(rep.p, rep.r);
  });
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Modified:', path.basename(path.dirname(file)) + '/' + path.basename(file));
  }
});
console.log('Done HTML.');
