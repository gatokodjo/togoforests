const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// ✅ FIXED STATIC PATH
app.use(express.static(path.join(__dirname, '../public')));

app.use('/auth', require('./routes/auth'));
app.use('/forests', require('./routes/forests'));

app.listen(3000, () => console.log("Server running"));