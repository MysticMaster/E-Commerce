import path from "path";

const configViewEngine = (app) => {
    app.set('views', path.join('./src', 'ui'));
    app.set('view engine', 'ejs');
}

export default configViewEngine;