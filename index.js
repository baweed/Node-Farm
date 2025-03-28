import { readFileSync, writeFileSync, readFile, writeFile } from 'node:fs';
import { createServer } from 'node:http';
import url from 'node:url';
import replaceTemplate from './modules.js/replaceTemplate.js';

////////////////////////////////////////////
//FILES

// BloCKING and synchronous way
// const textIn = readFileSync("./txt/input.txt", "utf-8");
// console.log(textIn);

// const textOut = `This is what we know about the avocado: ${textIn}. \nCreated on ${Date.now()}`;
// writeFileSync("./txt/output.txt", textOut);

// readFile("./txt/start.txt", "utf-8", (error, data1) => {
//     readFile(`./txt/${data1}.txt`, "utf-8", (error, data2) => {
//         console.log(data2);
//         readFile(`./txt/append.txt`, "utf-8", (error, data3) => {
//             console.log(data3);

//             writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", (err) => {
//                 console.log('Your file has been writen');
//             })
//         });
//     });
// });
// console.log('reading file...')

////////////////////////////////////////////
// Server


const tempOverview = readFileSync(`./templates/template-overview.html`, 'utf-8');
const tempCard = readFileSync(`./templates/template-card.html`, 'utf-8');
const tempProduct = readFileSync(`./templates/template-product.html`, 'utf-8');

const data = readFileSync('./dev-data/data.json', 'utf-8');
const dataObject = JSON.parse(data);

const server = createServer((request, response) => {
    const baseUrl = `http://${request.headers.host}/`;
    const reqURL = new URL(request.url, baseUrl);
    const query = {};
    for (const [key, value] of reqURL.searchParams.entries()) {
        query[key] = value;
    }
    const pathName = reqURL.pathname;

    // Ignore favicon requests
    if (pathName === '/favicon.ico') {
        response.writeHead(204);
        response.end();
        return;
    }

    // OVERVIEW PAGE
    if (pathName === '/overview' || pathName === '/') {
        response.writeHead(200, { "content-type": 'text/html' });
        const cardsHtml = dataObject.map(el => replaceTemplate(tempCard, el)).join('');
        const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
        response.end(output);

    // PRODUCT PAGE
    } else if (pathName === '/product') {
        response.writeHead(200, {
            'Content-type': 'text/html'
        });
        const product = dataObject[query.id];
        const output = replaceTemplate(tempProduct, product);
        response.end(output);

    // API PAGE
    } else if (pathName === '/api') {
        response.writeHead(200, { "content-type": 'application/json' });
        response.end(data);

    // NOT FOUND
    } else {
        response.writeHead(404, {
            'Content-type': 'text/html',
        });
        response.end('Page not found');
    }
});

server.listen(8000, '127.0.0.1', () => {
    console.log('Listening to requests on port 8000');
});