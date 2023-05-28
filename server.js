require('dotenv').config()
var cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser')
const { connectDB } = require('./src/libs/knex')

const intitial = async () => {
  const db = await connectDB()

  const port = 3001
  const app = express()

  app.use(cors())
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  // Create an API that returns a list of Todo exposing only the following attributes: 
  app.get('/task', async (req, res) => {
    let tasks = await db.select('*').from('todo').orderBy('id', 'asc')
    tasks = tasks.map(val => ({
      ...val,
      sub_tasks: tasks.filter(o => o.task_id == val.id)
    })).filter(o => !o.task_id)

    return res.send(tasks)
  })

  // Create an API that creates a Todo accepting the following attributes: 
  app.post('/task', async (req, res) => {
    const title = req.body?.title
    if (!title) return res.status(500).send('title required.')

    let task = await db
      .insert({ title, status: 'inactive' })
      .returning('*')
      .into('todo')
    task = task?.[0] || {}

    return res.send(task)
  })

  // Create an API that creates a Subtask and assign it to a specific Todo accepting the following attributes: 
  app.post('/subtask', async (req, res) => {
    const { title, todo_id } = req.body
    if (!todo_id || !title) return res.status(500).send('todo_id and title required.')

    let task = await db
      .select('*')
      .where({ id: todo_id })
      .from('todo')

    task = task?.[0]
    if (!task) return res.status(500).send('todo_id not found.')

    let subtask = await db
      .insert({ title, task_id: todo_id, status: 'inactive' })
      .returning('*')
      .into('todo')
    subtask = subtask?.[0]

    if (task.status === 'active') {
      await db
        .where({ id: todo_id })
        .update({ status: 'inactive' })
        .into('todo')
    }

    return res.send(subtask)
  })

  // Create an API that updates a Todo accepting the following attributes:
  // Create an API that updates a Subtask accepting the following attributes:
  // status
  app.put('/task/:taks_id', async (req, res) => {
    const { taks_id } = req.params
    const { status } = req.body

    if (!status) return res.status(500).send('status required.')

    let task = await db
      .where({ id: taks_id })
      .update({ status })
      .returning('*')
      .into('todo')

    task = task?.[0] || {}

    if (!task.task_id) {
      await db.where({ task_id: task.id }).update({ status: task.status }).into('todo')
    } else {
      let parent_id = task.task_id
      let subtasks = await db.select('*').where({ task_id: parent_id }).from('todo')
      const isAllActive = subtasks.every(o => o.status === 'active')
      await db.where({ id: parent_id }).update({ status: isAllActive ? 'active' : 'inactive' }).into('todo')
    }

    return res.send(task)
  })

  app.listen(port, () => {
    console.log(`app listening on port ${port}`)
  })
}

intitial();
