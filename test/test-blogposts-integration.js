'use strict'

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const { Blogpost } = require('../models');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

function seedBlogpostData() {
  console.info('seeding blogpost data');
  const seedData = [];

  for(i = 1; i <= 10; i++) {
    seedData.push(generateBlogpostData());
  }

  return Blogpost.insertMany(seedData);
}

function generateBlogpostData() {
  return {
    title: `${ faker.random.word() } ${ faker.random.word() }`,
    author: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    },
    content: faker.lorem.paragraph();
  };
}

function tearDownDb() {
  console.warn('tearing down database');
  mongoose.connection.dropDatabase();
}

describe('Blogposts API resource', function() {

  before(function() {
    return runserver(TEST_DATABASE_URL);
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

  });

  describe('POST endpoint', function() {

  });

  describe('PUT endpoint', function() {

  });

  describe('DELETE endpoint', function() {

  });
});