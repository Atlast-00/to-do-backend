require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const { connectDB } = require('./src/libs/knex')

const intitial = async () => {
  const db = await connectDB()

  const port = 3000
  const app = express()

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  // Create an API that returns a list of Todo exposing only the following attributes: 
  app.get('/', async (req, res) => {
    const result = await db.select('*').from('todo')
    res.send(result)
  })

  // Create an API that creates a Todo accepting the following attributes: 
  app.post('/task', async (req, res) => {
    const title = req.body?.title
    if (!title) return res.status(500).send('title required.')

    const result = await db
      .insert({ title })
      .returning('*')
      .into('todo')

    res.send(result[0])
  })

  // Create an API that creates a Subtask and assign it to a specific Todo accepting the following attributes: 
  app.post('/subtask', async (req, res) => {
    const { title, todo_id } = req.body
    if (!todo_id || !title) return res.status(500).send('todo_id and title required.')

    const result = await db
      .insert({ title, task_id: todo_id })
      .returning('*')
      .into('todo')

    res.send(result[0])
  })

  // Create an API that updates a Todo accepting the following attributes:
  // Create an API that updates a Subtask accepting the following attributes:
  // status
  app.put('/task/:taks_id', async (req, res) => {
    const { taks_id } = req.params
    const { status } = req.body

    if (!status) return res.status(500).send('status required.')

    const result = await db
      .where({ id: taks_id })
      .update({ status })
      .returning('*')
      .into('todo')

    res.send(result[0])
  }) 

  app.listen(port, () => {
    console.log(`app listening on port ${port}`)
  })
}

intitial();
