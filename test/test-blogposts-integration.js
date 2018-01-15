'use strict'

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const { BlogPost } = require('../models');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

function seedBlogpostData() {
  console.info('seeding blogpost data');
  const seedData = [];

  for(let i = 1; i <= 10; i++) {
    seedData.push(generateBlogpostData());
  }

  return BlogPost.insertMany(seedData);
}

function generateBlogpostData() {
  return {
    title: `${ faker.random.word() } ${ faker.random.word() }`,
    author: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    },
    content: faker.lorem.paragraph()
  };
}

function tearDownDb() {
  console.warn('tearing down database');
  mongoose.connection.dropDatabase();
}

describe('Blogposts API resource', function() {

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedBlogpostData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('GET endpoint', function() {

    it('should return all existing blogposts', function() {
      let res;
      return chai.request(app)
        .get('/posts')
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body).to.have.length.of.at.least(1);
          return BlogPost.count();
        })
        .then(function(count) {
          expect(res.body).to.have.length(count);
        });
    });

    it('should return blogposts with correct fields', function() {
      let resBlogpost;
      return chai.request(app)
        .get('/posts')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');

          res.body.forEach(function(blogpost) {
            expect(blogpost).to.be.a('object');
            expect(blogpost).to.include.keys(
              'id', 'title', 'author', 'content', 'created');
          })
          resBlogpost = res.body[0];
          return BlogPost.findById(resBlogpost.id);
        })
        .then(function(blogpost) {
          expect(blogpost.id).to.equal(resBlogpost.id);
          expect(blogpost.title).to.equal(resBlogpost.title);
          expect(blogpost.author).to.not.be.null;
          expect(blogpost.content).to.equal(resBlogpost.content);
          expect(blogpost.created).to.not.be.null;
        });
    });
  });

  describe('POST endpoint', function() {

    it('should create a new blog post', function() {
      const newPost = generateBlogpostData();

      return chai.request(app)
        .post('/posts')
        .send(newPost)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.include.keys(
            'id', 'title', 'author', 'content', 'created');
          expect(res.body.id).to.not.be.null;
          expect(res.body.created).to.not.be.null;

          expect(res.body.title).to.equal(newPost.title);
          expect(res.body.author).to.equal(`${ newPost.author.firstName } ${ newPost.author.lastName }`);
          expect(res.body.content).to.equal(newPost.content);
        })
    });
  });

  describe('PUT endpoint', function() {

    it('should update fields that are sent', function() {
      const updateData = {
        title: 'etetetetet',
        content: 'testtesttest',
        author: {
          firstName: '20',
          lastName: '20'
        }
      };

      return BlogPost
        .findOne()
        .then(function(blogpost) {
          updateData.id = blogpost.id;
          updateData.created = blogpost.created;

          return chai.request(app)
            .put(`/posts/${ updateData.id }`)
            .send(updateData)
        })
        .then(function(res) {
          expect(res).to.have.status(204);

          return BlogPost.findById(updateData.id);
        })
        .then(function(blogpost) {
          expect(blogpost.title).to.equal(updateData.title);
          expect(blogpost.content).to.equal(updateData.content);
          expect(blogpost.author.firstName).to.equal(updateData.author.firstName);
          expect(blogpost.author.lastName).to.equal(updateData.author.lastName);
        });
    });
  });

  describe('DELETE endpoint', function() {

    it('should remove the post with matching id', function() {
      let postId;

      return BlogPost
        .findOne()
        .then(function(blogpost) {
          postId = blogpost.id;

          return chai.request(app)
            .delete(`/posts/${ postId }`)
        })
        .then(function(res) {
          expect(res).to.have.status(204);

          return BlogPost.findById(postId);
        })
        .then(function(res) {
          expect(res).to.be.null;
        });
    });
  });
});