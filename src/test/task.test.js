const request = require("supertest");
const app = require("../src/app");
const { connection } = require("../src/models");

describe("Task API", () => {
  before((done) => {
    connection.connect(done);
  });

  after((done) => {
    connection.end(done);
  });

  it("should get all tasks", (done) => {
    request(app)
      .get("/task")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });

  it("should get a task by ID", (done) => {
    const taskId = 1;
    request(app)
      .get(`/task/${taskId}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });

  it("should create a new task", (done) => {
    const newTask = {
      title: "Test Task",
      description: "This is a test task",
      status: "En cours",
      startDate: "2025-03-01T00:00:00Z",
      endDate: "2025-03-02T00:00:00Z",
    };
    request(app)
      .post("/task")
      .send(newTask)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });

  it("should update a task", (done) => {
    const taskId = 1; // Assurez-vous que cette tâche existe dans votre base de données
    const updatedTask = {
      title: "Updated Task",
      description: "This is an updated test task",
      status: "Terminé",
      startDate: "2025-03-01T00:00:00Z",
      endDate: "2025-03-02T00:00:00Z",
    };
    request(app)
      .put(`/task/${taskId}`)
      .send(updatedTask)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });

  it("should delete a task", (done) => {
    const taskId = 1; // Assurez-vous que cette tâche existe dans votre base de données
    request(app)
      .delete(`/task/${taskId}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
});