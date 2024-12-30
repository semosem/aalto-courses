import { postgres } from "./deps.js";
import * as todoServices from "./services/todoService.js";
import { cacheMethodCalls } from "./util/cacheUtil.js";

const cachedItemService = cacheMethodCalls(todoServices, ["addTodo"]);

const handleGetAllTodos = async () => {
  try {
    const todos = await cachedItemService.getTodos();

    return Response.json(todos);
  } catch (err) {
    return new Response(err);
  }
};

const handleGetTodo = async (req, urlPtrn) => {
  try {
    const { id } = urlPtrn.pathname.groups;
    const todo = await cachedItemService.getTodo(id);

    if (todo) {
      return Response.json(todo);
    } else {
      return new Response("Error GET todo", { status: 404 });
    }
  } catch (error) {
    return new Response("Error GET todo", error);
  }
};

const handleDeleteTodo = async (req, urlPtrn) => {
  try {
    const { id } = urlPtrn.pathname.groups;
    const deletedTodo = await cachedItemService.deleteTodo(id);

    if (deletedTodo) {
      return Response.json(deletedTodo);
    } else {
      return new Response("Error 404 DELETE todo", { status: 404 });
    }
  } catch (error) {
    return new Response("Error DELETE todo", error);
  }
};

const handleAddTodo = async (req) => {
  try {
    const todo = await req.json();
    const { item } = todo;

    if (item) {
      await cachedItemService.addTodo(item);

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
    pattern: new URLPattern({ pathname: "/todos/:id" }),
    fn: handleDeleteTodo,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/todos" }),
    fn: handleAddTodo,
  },
];

const handleRequest = async (request) => {
  const reqMap = urlMapping.find(
    (um) => um.pattern.test(request.url) && um.method === request.method
  );

  if (!reqMap) return new Response("Not found", { status: 404 });
  const mappingResult = reqMap.pattern.exec(request.url);

  try {
    return await reqMap.fn(request, mappingResult);
  } catch (e) {
    console.log(e);
    return new Response(e.stack, { status: 500 });
  }
};

Deno.serve({ port: 7777, hostname: "0.0.0.0" }, handleRequest);
