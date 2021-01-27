const
    express = require('express'),
    normalizePort = require('normalize-port'),
    path = require('path');
const
    app = express(),
    port = normalizePort(process.env.PORT||'80');

app.use(express.static(path.join(__dirname, 'public', 'assets')));

/* Pages */
app.get('/', (req, res) => {
    res.render('index', {title: 'Jubatus', message: 'Home page' });
});
app.get('/about', (req, res) => {
    res.render('about', {title: 'About', message: 'About page'});
});
app.get('/settings', (req, res) => {
    res.render('settings', {title: 'Settings', message: 'Settings page' });
});
app.get('/profile', (req, res) => {
    res.render('profile', {title: 'Profile', message: 'Profile page'});
});
/* End pages */
app
    .listen(port, () => {
        console.log(`Example app listening at http://jubatus:${port}`)
    });