#!/usr/bin/node

const { MongoClient } = require('mongodb');
const mongo = require('mongodb');
// const pwdHashed = require('./utils');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    const dbUrl = `mongodb://${host}:${port}`;
    this.connected = false;
    this.client = new MongoClient(dbUrl, { useUnifiedTopology: true });
    this.client.connect().then(() => {
      this.connected = true;
    }).catch((err) => console.error(err.message));
  }

  isAlive() {
    return this.connected;
  }

  async nbUsers() {
    await this.client.connect();
    const userCount = await this.client.db(this.database).collection('users').countDocuments();
    return userCount;
  }

  async nbFiles() {
    await this.client.connect();
    const users = await this.client.db(this.database).collection('files').countDocuments();
    return users;
  }

  async getUser(email) {
    await this.client.connect();
    const user = await this.client.db(this.database).collection('users').find({ email }).toArray();
    if (!user.length) {
      return null;
    }
    return user[0];
  }

  async getUserById(id) {
    const _id = new mongo.ObjectID(id);
    await this.client.connect();
    const user = await this.client.db(this.database).collection('users').find({ _id }).toArray();
    if (!user.length) {
      return null;
    }
    return user[0];
  }

  async userExist(email) {
    const user = await this.getUser(email);
    if (user) {
      return true;
    }
    return false;
  }

  async uploadFile(userId, name, type, isPublic, parentId, localPath = null) {
    await this.client.connect();
    const obj = {
      userId, name, type, isPublic, parentId,
    };
    if (localPath) {
      obj.localPath = localPath;
    }
    const file = this.client.db(this.database).collection('files').insertOne(obj);
    return file;
  }

  async getFileById(id) {
    const _id = new mongo.ObjectID(id);
    await this.client.connect();
    const file = await this.client.db(this.database).collection('files').find({ _id }).toArray();
    if (!file.length) {
      return null;
    }
    return file[0];
  }
}

const dbClient = new DBClient();
module.exports = dbClient;