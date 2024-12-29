import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";

const sql = postgres({});

const handleGetAllTodos = async () => {
  try {
    const todos = await sql`SELECT * FROM todos`;

    return Response.json(todos, { status: 200 });
  } catch (err) {
    return new Response(err);
  }
};

const handleGetTodo = async (req, urlPtrn) => {
  try {
    const { id } = urlPtrn.pathname.groups;

    const todos = await sql`SELECT * FROM todos WHERE id = ${id}`;

    if (todos[0]) {
      return Response.json(todos[0]);
    } else {
      return new Response("Error GET todo", { status: 404 });
    }
  } catch (error) {
    return new Response("Error GET todo", error);
  }
};

const handlePostTodo = async (req) => {
  try {
    const todo = await req.json();
    const { item } = todo;
    if (item) {
      await sql`INSERT INTO todos (item) VALUES (${item})`;

      return new Response(`OK`, { status: 200 });
    } else {
      return new Response("Error POST todo", { status: 400 });
    }
  } catch (err) {
    return new Response("Error POST todo", { status: 400 });
  }
};

const urlMapping = [
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/todos/:id" }),
    fn: handleGetTodo,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/todos" }),
    fn: handleGetAllTodos,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/todos" }),
    fn: handlePostTodo,
  },
];

const handleRequest = async (request) => {
  const reqMap = urlMapping.find(
    (um) => um.pattern.test(request.url) && um.method === request.method
  );

  if (!reqMap) return new Response("Not found", { status: 404 });
  const mappingResult = reqMap.pattern.exec(request.url);

  return await reqMap.fn(request, mappingResult);
};

Deno.serve({ port: 7777 }, handleRequest);
