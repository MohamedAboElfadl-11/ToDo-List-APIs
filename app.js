const express = require("express");

const app = express();

const fs = require("fs");

const path = require("path");

const filePath = path.join(__dirname, "tasks.json");

const now = new Date();
const formattedDate = new Intl.DateTimeFormat("en-EG", {
  dateStyle: "short",
  timeStyle: "short",
}).format(now);

const PORT = 3000;

// validate task data Middleware
const validateTask = (req, res, next) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(401).json({
      error: "title and description are required..",
    });
  }
  next();
};

app.use(express.json());

// create user task
app.post("/createTask", validateTask, (req, res) => {
  const { title, description } = req.body;
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(400).json({
        error: `error happen ====>> ${err}`,
      });
    }
    let tasks = [];
    try {
      if (data) tasks = JSON.parse(data);
    } catch (err) {
      return res.status(400).json({
        error: "error while reading file data !!",
      });
    }

    const newId = tasks.length
      ? Math.max(...tasks.map((task) => task.id)) + 1
      : 1;

    const taskData = {
      id: newId,
      title,
      description,
      Status: "New",
      Date: formattedDate,
    };
    tasks.push(taskData);
    fs.writeFile(filePath, JSON.stringify(tasks, null, 2), (err) => {
      if (err) {
        return res.status(400).json({
          error: "can not write in this file",
        });
      }
    });
    res.status(201).json({
      message: "task created successfully..!",
      taskData,
      date: formattedDate,
    });
  });
});
// get all tasks
app.get("/getAllTasks", (req, res) => {
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(400).json({
        error: `error happen ====>> ${err}`,
      });
    }
    let tasks = [];
    try {
      if (data) tasks = JSON.parse(data);
    } catch (err) {
      return res.status(400).json({
        error: "can not read this file ",
      });
    }
    if (!tasks.length) {
      return res.status(202).json({
        message: "no tasks avilable...!",
        addTask: "you must go to add new task",
      });
    }
    res.status(200).json({
      message: "this is your tasks",
      tasks,
    });
  });
});
// get task by ID
app.get("/getTask/:id", (req, res) => {
  const searchID = Number(req.params.id);
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(400).json({
        error: `this is error ======> ${err}`,
      });
    }
    let tasks = [];
    try {
      if (data) tasks = JSON.parse(data);
    } catch (err) {
      return res.status(400).json({
        error: "can not read this file ",
      });
    }
    const taskID = tasks.findIndex((task) => task.id === searchID);

    if (taskID === -1) {
      return res.status(404).json({ error: "Task ID not found" });
    }
    const taskData = tasks[taskID];
    res.status(201).json({
      message: "your task is...",
      taskData,
    });
  });
});
// update task by ID
app.patch("/updateTask/:id", validateTask, (req, res) => {
  const { title, description, Status } = req.body;
  const searchID = Number(req.params.id);
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(400).json({
        error: `this is error ======> ${err}`,
      });
    }
    let tasks = [];
    try {
      if (data) tasks = JSON.parse(data);
    } catch (err) {
      return res.status(400).json({
        error: "can not read this file ",
      });
    }

    const taskID = tasks.findIndex((task) => task.id === searchID);

    if (taskID === -1) {
      return res.status(404).json({ error: "Task ID not found" });
    }

    const taskData = tasks[taskID];

    taskData.title = title;
    taskData.description = description;
    taskData.Status = Status;
    taskData.Date = `Updated at ${formattedDate}`;

    const updatedTask = {
      id: taskID + 1,
      title: taskData.title,
      description: taskData.description,
      Status: taskData.Status,
      date: `Updated at ${formattedDate}`,
    };

    fs.writeFile(filePath, JSON.stringify(tasks, null, 2), (err) => {
      if (err)
        return res
          .status(400)
          .json({ error: `Failed to update your task ${err}` });
      res.status(201).json({
        message: "Task updated successfully..!",
        updatedTask,
      });
    });
  });
});
// delete task by ID
app.delete("/deleteTask/:id", (req, res) => {
  const searchID = Number(req.params.id);
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err)
      return res.status(400).json({
        error: `error happen ===> ${err}`,
      });

    let tasks = [];

    try {
      if (data) tasks = JSON.parse(data);
    } catch (err) {
      return res.status(401).json({
        error: "can not read file data",
      });
    }

    const updatedTasks = tasks.filter((task) => task.id !== searchID);

    if (tasks.length === updatedTasks.length) {
      return res.status(404).json({ error: "Task not found" });
    }
    console.log(updatedTasks);
    fs.writeFile(filePath, JSON.stringify(updatedTasks, null, 2), (err) => {
      if (err) {
        return res.status(400).json({ error: `Failed to write file: ${err}` });
      }
      res.status(200).json({ message: "Task deleted successfully!" });
    });
  });
});
// run server
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
