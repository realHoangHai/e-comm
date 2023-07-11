const app = require("./src/app");

const PORT = 10808

const server = app.listen(PORT, () => {
    console.log(`server starting at http://localhost:${PORT}`);
})

process.on('SIGINT', () => {
    server.close(() => console.log(`server stopping`))
})