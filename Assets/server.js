//use express, mongodb, and establish the port

const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3001;

const connectionStringURI = `mongodb://127.0.0.1:27017`;

const client = new MongoClient(connectionStringURI);

let db;

const dbName = 'userListDB';

//when connected will not create multiples

client.connect()
  .then(() => {
    console.log('Connected successfully to MongoDB');
    db = client.db(dbName);
    // Drops any documents, if they exist
    db.collection('userList').deleteMany({});
    // Adds data to database
    db.collection('userList').insertMany(data)
      .then(res => console.log(res))
      .catch(err => {
        if (err) return console.log(err);
      });

    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Mongo connection error: ', err.message);
  });

// Data for document
const data = [
  {
    user: 'BabyPink',
    // One-to-many relationship
    // Each book has multiple authors
    thoughts: [
      { thought: 'The rain ruined my bday.', featured: true },
      { thought: 'Pink is better than blue.', featured: true },
    ],
    reactions: [
      {reaction: 'I would have come to your part even in the rain, sorry I missed it.'}
    
    ]
  },
  {
    user: 'GossipGirl',
    thoughts: [
      { thought: 'What are the moves tonight?', featured: true },
    
    ],
    reactions: [
      {reaction: 'Girl, go to bed.'}
    
    ]
  },
  {
    user: 'HubbaBubba',
    thoughts: [
      { thought: 'I loved the new spiderman movie.', featured: true },
      { thought: 'My gf is the best.', featured: true },
    ],
    reactions: [
      {reaction: 'Loved seeting it with you!'}
    
    ]
  },
];

app.use(express.json());

//ROUTES

//GET route

app.get('/user-thoughts', (req, res) => {
  db.collection('userList')
    // If you do not know the array index, use dot notation to access fields nested in arrays
    .find({ 'thoughts.featured': true })
    .toArray()
    .then(results => res.send(results))
    .catch(err => {
      if (err) throw err;
    });
});

//POST Route

app.post('/new-user-thoughts', (req, res) => {
  const { user, thought, featured } = req.body;

  if (!user || !thought || featured === undefined) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  db.collection('userList')
    .findOneAndUpdate(
      { user: user },
      { $push: { thoughts: { thought: thought, featured: featured } } },
      { returnOriginal: false }
    )
    .then(updatedDocument => {
      if (updatedDocument) {
        res.status(201).json(updatedDocument.value);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    })
    .catch(err => {
      console.log('Error updating document: ', err);
      res.status(500).json({ error: 'Something went wrong' });
    });
});

//Delete route


app.delete('/user-thoughts/:user', (req, res) => {
  const user = req.params.user;

  db.collection('userList')
    .findOneAndUpdate(
      { user },
      { $unset: { thoughts: '' } },
      { returnOriginal: false }
    )
    .then(updatedDocument => {
      if (updatedDocument) {
        res.status(200).json(updatedDocument.value);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    })
    .catch(err => {
      console.log('Error updating document: ', err);
      res.status(500).json({ error: 'Something went wrong' });
    });
});

//PUT/Update Route to specifc user

app.put('/update-user-thoughts/:user', (req, res) => {
  const user = req.params.user;
  const { thought, featured } = req.body;

  if (!thought || featured === undefined) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  db.collection('userList')
    .findOneAndUpdate(
      { user },
      { $push: { thoughts: { thought, featured } } },
      { returnOriginal: false }
    )
    .then(updatedDocument => {
      if (updatedDocument) {
        res.status(200).json(updatedDocument.value);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    })
    .catch(err => {
      console.log('Error updating document: ', err);
      res.status(500).json({ error: 'Something went wrong' });
    });
});

//add reaction

app.post('/user-reactions/:user', (req, res) => {
  const user = req.params.user;
  const { reaction } = req.body;

  if (!reaction) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  db.collection('userList')
    .findOneAndUpdate(
      { user },
      { $push: { reactions: { reaction } } },
      { returnOriginal: false }
    )
    .then(updatedDocument => {
      if (updatedDocument) {
        res.status(201).json(updatedDocument.value);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    })
    .catch(err => {
      console.log('Error updating document: ', err);
      res.status(500).json({ error: 'Something went wrong' });
    });
});

//delete reaction

app.delete('/user-reactions/:user', (req, res) => {
  const user = req.params.user;

  db.collection('userList')
    .findOneAndUpdate(
      { user },
      { $unset: { reactions: '' } },
      { returnOriginal: false }
    )
    .then(updatedDocument => {
      if (updatedDocument) {
        res.status(200).json(updatedDocument.value);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    })
    .catch(err => {
      console.log('Error updating document: ', err);
      res.status(500).json({ error: 'Something went wrong' });
    });
});
