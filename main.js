const { resolve, basename } = require('path');
const { app, Menu, Tray, dialog } = require('electron');
const spawn = require('cross-spawn')
const Store = require('electron-store');

const isWindows = process.platform.includes('win');

const schema = {
    projects: {
        type: 'string',
    },
};

const store = new Store({ schema });

if (app.dock) {
    app.dock.hide();
}

let tray = null;

function render() {
    const storedProjects = store.get('projects');
    const projects = storedProjects ? JSON.parse(storedProjects) : [];

    const items = projects.map(({ name, path }) => ({
        label: name,
        icon: resolve(__dirname, 'assets', 'iconProjects.png'),
        submenu: [
            {
                label: `Abrir no VSCode`,
                icon: resolve(__dirname, 'assets', 'iconVscode.png'),
                click: () => spawn('code', [path])
            },
            {
                label: 'Abrir no Explorer',
                icon: resolve(__dirname, 'assets', 'iconExplorer.png'),
                click: () => spawn('explorer', [path])
            },
            {
                label: 'Ações do NODE',
                icon: resolve(__dirname, 'assets', 'iconNode.png'),
                submenu: [
                    {
                        label: 'Script: START',
                        click: () => spawn('start', [`${[path]}`, 'start.bat'], { cwd: `${[path]}` })
                    },
                    {
                        label: 'Script: DEV',
                        click: () => spawn('start', [`${[path]}`, 'dev.bat'], { cwd: `${[path]}` })
                    }
                ]
            },
            {
                label: 'Remover',
                icon: resolve(__dirname, 'assets', 'iconDelete.png'),
                click: () => {
                    store.set('projects', JSON.stringify(projects.filter(item => item.path !== path)));
                    render();
                }
            }
        ]
    }));

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Adicionar novo projeto',
            icon: resolve(__dirname, 'assets', 'iconAdd.png'),
            click: () => {
                const result = dialog.showOpenDialog({ properties: ['openDirectory'] });

                if (!result) return;

                const [path] = result;
                const name = basename(path);

                store.set('projects', JSON.stringify([
                    ...projects,
                    {
                        path,
                        name,
                    }
                ]));

                render();
            }
        },
        {
            type: 'separator'
        },
        ...items,
        {
            type: 'separator'
        },
        {
            type: 'normal',
            label: 'Fechar VSCode Tray',
            icon: resolve(__dirname, 'assets', 'iconClose.png'),
            role: 'quit',
            enabled: true
        }
    ]);
    tray.setContextMenu(contextMenu);
}

app.on('ready', () => {
    tray = new Tray(resolve(__dirname, 'assets', `icon${isWindows ? 'White' : ''}Template.png`));

    render();
});