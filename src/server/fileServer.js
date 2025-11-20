// server/fileServer.js
const express = require('express');
const app = express();
const path = require('path');

app.use('/storage', express.static('D:/onlineSchoolProject/admin-app-php/storage/app/public'));

app.listen(3001, () => {
    console.log('File server running on http://localhost:3001');
});

module.exports = fileServer;