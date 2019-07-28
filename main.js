const { resolve } = require('path');
const { app, Menu, Tray } = require('electron');

if (app.dock) {
  app.dock.hide();
}

app.on('ready', () => {
  const tray = new Tray(resolve(__dirname, 'assets', 'iconTemplate.png'));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Adicionar novo projeto',
      type: 'radio',
      checked: true
    }
  ]);

  tray.setToolTip('VSCode Tray')
  tray.setContextMenu(contextMenu);
});