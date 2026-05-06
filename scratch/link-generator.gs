/**
 * HERRAMIENTA TEMPORAL: GENERADOR DE LINKS
 * Ejecuta la función 'generarLinks' y copia el resultado de la consola.
 */
function generarLinks() {
  var folderId = '1ooT2yyhaGeIGn3aN2O43VbyI-DLk6DIU';
  var folder = DriveApp.getFolderById(folderId);
  var files = folder.getFiles();
  
  console.log("--- COPIA DESDE AQUÍ ---");
  while (files.hasNext()) {
    var file = files.next();
    // Les damos permiso de lectura una sola vez
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var link = file.getDownloadUrl().replace("?e=download&gd=true", "");
    console.log(file.getName() + " : " + link);
  }
  console.log("--- HASTA AQUÍ ---");
}
