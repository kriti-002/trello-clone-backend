const express = require('express');
const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors())

const mongoose= require('mongoose')
mongoose.set('strictQuery', false)

require('dotenv').config()
const bodyParser = require('body-parser');
app.use(bodyParser.json());


const port = process.env.PORT || 8081

const uri= process.env.MONGODB_URI
let db=mongoose.connection

mongoose.connect(uri).then(
    ()=>{
        app.listen(port, ()=> {
            console.log('Express server ran!')

        })
    }
).catch((err)=> console.log(err))

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

const NoteSchema= mongoose.Schema({
    title: {type: String, required: true, maxlength: 50},
    body: {type: String, required: true, maxlength: 100},
    category: {type: String}
})
const Note= mongoose.model('Note',NoteSchema)

app.post('/api/create',async (req, res)=>{
    try{
    const title= req.body.title, body=req.body.body, category=req.body.category
    const card= new Note({title, body, category})
    await card.save();
    res.status(200).json({ message: 'Document inserted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
  }
})

app.delete('/api/delete/:id', async(req,res)=>{
  var id = new mongoose.Types.ObjectId(req.params.id);
    try {
        const deletedItem = await Note.deleteOne({_id: id});
    
        if (!deletedItem) {
          return res.status(404).json({ message: 'Item not found' });
        }
    
        return res.status(200).json({ message: 'Item deleted successfully' });
      } catch (error) {
        console.error('Error deleting item:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
})

app.post('/api/update/:id', async (req, res) => {
    const id = req.params.id;
    const newData = req.body;

    try {
      const updatedNote = await Note.findByIdAndUpdate(id, newData, { new: true });
  
      if (!updatedNote) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json(updatedNote);
    } catch (error) {
      res.status(500).json({ message: 'Error updating user', error: error.message });
    }
  });

  app.get('/api/all', async(req, res)=>{
    try {
        const all= await Note.find()
        if (!all) {
            return res.status(404).json({ message: 'DB is empty' });
          }
          res.status(200).json(all);
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: 'Internal Server Error'})
    }
  })



