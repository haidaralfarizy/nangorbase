const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf-8');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", (error) => {
  console.error("JSDOM Error:", error);
});
virtualConsole.on("jsdomError", (error) => {
  console.error("JSDOM jsdomError:", error);
});

const dom = new JSDOM(html, { 
    runScripts: "dangerously", 
    resources: "usable",
    virtualConsole
});

setTimeout(() => {
    console.log("Done waiting");
}, 2000);
