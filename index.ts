const { Aki } = require("aki-api");
const inquirer = require("inquirer");
const figlet = require("figlet");
const terminalImage = require("terminal-image");
const got = require("got");
const ora = require("ora");

//Akinator ya configurado y funcionando
async function akinatorConfigured() {
  const region = "es";
  const childMode = false;
  const spinner = ora("Despertando al mago...").start();
  spinner.color = "blue";

  const akinator = new Aki({ region, childMode });
  await akinator.start();
  spinner.stop();

  return akinator;
}

//Muestra el titulo de la aplicacion
async function showTitle() {
  console.log(
    await figlet.text("AKINATOR!", {
      font: "Standard",
      horizontalLayout: "default",
      verticalLayout: "default",
      width: 80,
      whitespaceBreak: true,
    })
  );
}

async function main() {
  let isPlaying = true;
  let akinator = await akinatorConfigured();

  while (isPlaying) {
    console.clear();
    await showTitle();
    console.log("\n\n");

    //Le hace la pregunta al usuario y obtiene una respuesta
    const { respuesta } = await inquirer.prompt([
      {
        type: "rawlist",
        name: "respuesta",
        message: akinator.question,
        choices: [...akinator.answers],
      },
    ]);

    //Obtiene el indice de la respuesta del usuario (ya que akinator solo acepta la posicion del array (akinator.answers))
    const myAnswer = akinator.answers.reduce(
      (accumulator: number, actualValue: string, index: number) => {
        if (actualValue === respuesta) {
          accumulator = index;
        }
        return accumulator;
      },
      0
    );

    //Envia a akinator la eleccion del usuario
    await akinator.step(myAnswer);

    //Verifica si akinator ya ha adivinado el personaje
    if (akinator.progress >= 70) {
      //En caso de que haya adivinado muestra la informacion en pantalla (nombre e imagen)
      await akinator.win();
      const guess = akinator.answers[0];
      const response = await got(guess.absolute_picture_path, {
        responseType: "buffer",
      });
      const buffer = response.body;
      console.clear();
      console.log(
        await figlet.text(guess.name, {
          font: "Standard",
          horizontalLayout: "default",
          verticalLayout: "default",
          width: 40,
          whitespaceBreak: true,
        })
      );
      console.log(await terminalImage.buffer(buffer, { width: 50 }));

      const { keepPlaying } = await inquirer.prompt([
        {
          type: "rawlist",
          name: "keepPlaying",
          message: "¿seguir jugando?",
          choices: ["Si", "No"],
        },
      ]);
      if (keepPlaying.toLowerCase() === "si") {
        akinator = await akinatorConfigured();
        continue;
      }
      isPlaying = false;
    }
  }
}

main();
