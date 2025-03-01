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

  it("should get all taskStatus", (done) => {
    request(app)
      .get("/task-status")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });

  it("should get a taskStatus by ID", (done) => {
    const id = 1; 
    request(app)
      .get(`/task-status/${id}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });

    it("should create a new taskStatus", (done) => {
      const newTaskStatus = {
        status: "En cours",
      };
      request(app)
        .post("/task")
        .send(newTaskStatus)
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });

    it("should update a taskStatus", (done) => {
      const id = 1; 
      const updatedTaskStatus = {
        status: "Terminé",
      };
      request(app)
        .put(`/task-status/${id}`)
        .send(updatedTaskStatus)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });

    it("should delete a taskStatus", (done) => {
      const id = 1; 
      request(app)
        .delete(`/task-status/${id}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
});
