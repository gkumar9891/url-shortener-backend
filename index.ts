import express from "express";
const app = express();
const port = 8080;
debugger
app.listen(port, () => {
    console.log(`app is listening on port ${port}`)
})