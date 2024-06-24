const mongoose = require('mongoose');  // connecting monogodb
const express = require('express');// connecting express
const cors = require('cors');//connecting crosss origin
const app = express();
const port = process.env.PORT || 5000;

mongoose.connect('mongodb+srv://annapooranikumar71:7bFa242CnJr3l8sq@register.b8ohmww.mongodb.net/?retryWrites=true&w=majority&appName=Register')

    .then(() => {
        console.log('Connected to database');
    })
    .catch((err) => {
        console.error(err);
    });

const ToDoSchema = new mongoose.Schema({

    todo: { type: String, require: true },
});

const TodoCollection = mongoose.model('todo', ToDoSchema);



const SingupSchema=new mongoose.Schema({
    name:{type:String},
    email:{type:String},
    password:{type:String}
})

const SignupCollection =mongoose.model("signupcollection", SingupSchema);

app.use(express.json());
app.use(cors());

app.post('/posting', async (req, resp) => {
    try {
        const user = new TodoCollection(req.body);
        const results = await user.save();
        const datasending = results.toObject();
        resp.send(datasending);
    } catch (e) {
        console.error(e);
        resp.status(500).send('Something Went Wrong');
    }
});

app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await SignupCollection.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const newUser = new SignupCollection({ username, email, password });
        const savedUser = await newUser.save();
        const userToReturn = savedUser.toObject();
        delete userToReturn.password; // Don't return the password

        res.status(201).json(userToReturn);
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Something went wrong while saving data' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await SignupCollection.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const userToReturn = user.toObject();
       // delete userToReturn.password; // Don't return the password

        res.status(200).json(userToReturn);
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Something went wrong while logging in' });
    }
});










app.get('/getting', async (req, resp) => {
    try {
        const users = await TodoCollection.find({}, 'todo');
        resp.json(users);
    } catch (e) {
        console.error(e);
        resp.status(500).send('Failed to retrieve user data');
    }
});

app.put('/updating/:id', async (req, res) => {
    const { id } = req.params;
    const { todo } = req.body;

    try {
        const updatedTodo = await TodoCollection.findByIdAndUpdate(
            id,
            { todo },
            { new: true }
        );

        if (!updatedTodo) {
            return res.status(404).send('Todo not found');
        }

        res.json(updatedTodo);
    } catch (error) {
        console.error('Failed to update todo:', error);
        res.status(500).send('Failed to update todo');
    }
});



app.delete('/deleting/:id', async (req, resp) => {
    try {
        const { id } = req.params;

        const result = await TodoCollection.findByIdAndDelete(id);

        if (!result) {
            return resp.status(404).send('Todo not found');
        }

        resp.send('Todo deleted successfully');
    } catch (e) {
        console.error(e);
        resp.status(500).send('Failed to delete todo');
    }
});

app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});