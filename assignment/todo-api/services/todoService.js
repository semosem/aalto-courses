import { postgres } from "../deps.js";

const sql = postgres({});

const getTodo = async (id) => {
  const todos = await sql`SELECT * FROM todos WHERE id = ${id}`;
  return todos[0];
};

const deleteTodo = async (id) => {
  const todos = await sql`SELECT * FROM todos WHERE id = ${id}`;
  return todos[0];
};

const getTodos = async () => {
  return await sql`SELECT * FROM todos`;
};

const addTodo = async (item) => {
  await sql`INSERT INTO todos (item) VALUES (${item})`;
};

export { getTodo, deleteTodo, getTodos, addTodo };
