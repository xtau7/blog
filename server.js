const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const Comment = require('./models/Comment');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://localhost:27017/blog', { useNewUrlParser: true, useUnifiedTopology: true });

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).send('User registered');
    } catch (err) {
        console.error(err);  // Imprimir el error en la consola
        res.status(400).send('Error registering user');
    }
});


app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ username }, 'SECRET_KEY');
        res.json({ token });
    } else {
        res.status(400).send('Invalid credentials');
    }
});

// Rutas de Comentarios
app.post('/comments', async (req, res) => {
    const { token, content } = req.body;
    try {
        const decoded = jwt.verify(token, 'SECRET_KEY');
        const comment = new Comment({
            username: decoded.username,
            content
        });
        await comment.save();
        res.status(201).send('Comment saved');
    } catch (err) {
        res.status(400).send('Error saving comment');
    }
});

app.get('/comments', async (req, res) => {
    try {
        const comments = await Comment.find().sort({ date: -1 });
        res.json(comments);
    } catch (err) {
        res.status(400).send('Error fetching comments');
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
