const { app, BrowserWindow } = require("electron");

function criarJanela() {
  const janela = new BrowserWindow({
    width: 1100,
    height: 800,
    autoHideMenuBar: true,
  });

  janela.loadFile("index.html");
}

app.whenReady().then(criarJanela);

app.on("window-all-closed", function () {
  app.quit();
});