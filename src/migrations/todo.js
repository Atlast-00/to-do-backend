exports.up = function (knex) {
  return knex.schema
    .createTable('todo', function (table) {
      table.increments('id')
      table.text('title') 
      table.string('status', 255).defaultTo('active')
      table.datetime('created_at').defaultTo('now')
      table.bigint('task_id', 255)
    })
};

exports.down = function (knex) {
};
