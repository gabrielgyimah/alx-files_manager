#!/usr/bin/node

const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const { createFile } = require('../utils/utils');

class FilesController {
  static async currentUser(req) {
    const token = req.headers['x-token'];
    if (!token) {
      return null;
    }
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return null;
    }
    const user = await dbClient.getUserById(userId);
    if (!user) {
      return null;
    }
    return user;
  }

  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' }).end();
    }
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' }).end();
    }
    const user = await dbClient.getUserById(userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' }).end();
    }
    const { name, type, data } = req.body;
    let { parentId } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Missing name' }).end();
    }
    if (!type) {
      return res.status(400).json({ error: 'Missing type' }).end();
    }
    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' }).end();
    }
    if (parentId) {
      const file = await dbClient.getFileById(parentId);
      if (!file) {
        return res.status(400).json({ error: 'Parent not found' }).end();
      }
      if (file.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' }).end();
      }
    } else {
      parentId = 0;
    }
    const isPublic = (req.body.isPublic) ? req.body.isPublic : false;
    if (type === 'folder') {
      const fileObj = await dbClient.uploadFile(userId, name, type, isPublic, parentId);
      const file = fileObj.ops[0];
      /* eslint-disable */
      const obj = {
        id: file._id, userId: file.userId, name: file.name, type: file.type, isPublic: file.isPublic, parentId: file.parentId,
      };
      /* eslint-enable */
      return res.status(201).json(obj).end();
    }
    const localPath = createFile(data);
    const fileObj = await dbClient.uploadFile(userId, name, type, isPublic, parentId, localPath);
    const file = fileObj.ops[0];
    /* eslint-disable */
    const obj = {
      id: file._id, userId: file.userId, name: file.name, type: file.type, isPublic: file.isPublic, parentId: file.parentId,
    };
    /* eslint-enable */
    return res.status(201).json(obj).end();
  }
}

module.exports = FilesController;
